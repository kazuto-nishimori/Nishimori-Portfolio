import geopandas as gpd
import pandas as pd
import matplotlib as mpl
import USERAUTH
import flickr_api
from flickr_api.api import flickr
import json
import time
from json.decoder import JSONDecodeError
from requests.exceptions import ConnectionError

## How to use:
## open a blank python file
##     from hextile import makeshp, setup, exportjson, joinjson
##     a=setup()
##     makeshp(a)
## then once download is complete
##     exportjson(a)
## to append multiple files together
##     joinjson()

def centroid_coord(df): ## returns the input GeoDataFrame with added columns for lat and long in geodesic
    cent = df[['id','geometry']]
    cent = cent.to_crs({'init': 'epsg:4326'})
    cent['geometry'] = cent['geometry'].centroid
    cent['lat'] = cent['geometry'].apply(lambda p: p.y);
    cent['long'] = cent['geometry'].apply(lambda p: p.x);
    cent['pic'] = 0
    cent = cent[['id','lat','long','pic']]
    return df.merge(cent, on='id')

def hexpic(latd,long,rad): ## returns the number of pictures taken in integer form for a given lat, long, and radius,
    hex_pics_json = flickr.photos.search(privacy_filter = 1, accuracy = 16, lat=latd, lon=long, radius = rad, format= "json", nojsoncallback = 1)
    try:  
        hexpics = json.loads(hex_pics_json)
        if hexpics["photos"]["total"] is None:
            return 0
        else: 
            return int(hexpics["photos"]["total"])
    except JSONDecodeError as e:
        print("Encountered JSON error, restarting after 5 seconds...")
        time.sleep(5)
        hex_pics_json = flickr.photos.search(privacy_filter = 1, accuracy = 16, lat=latd, lon=long, radius = rad, format= "json", nojsoncallback = 1)
        hexpics = json.loads(hex_pics_json)
        if hexpics["photos"]["total"] is None:
            return 0
        else: 
            return int(hexpics["photos"]["total"])
    except ConnectionError as e:  
        print("Encountered connection error, restarting after 10 seconds...")
        time.sleep(10)
        hex_pics_json = flickr.photos.search(privacy_filter = 1, accuracy = 16, lat=latd, lon=long, radius = rad, format= "json", nojsoncallback = 1)
        hexpics = json.loads(hex_pics_json)
        if hexpics["photos"]["total"] is None:
            return 0
        else: 
            return int(hexpics["photos"]["total"])
    
def hydrate_hex(df, rad, start, finish): ## returns the input GeoDataFrame with added column for number of picture. 'rad' is radius in km
    if finish =='last':
        finish = df.lat.count()
    else:
        finish = finish
    for x in range(start, finish):
        df.loc[x,'pic'] = hexpic(df.loc[x,'lat'], df.loc[x,'long'], rad)
        print(x)
    return df

def check_hex(df,rad,x):
    hex_pics_json = flickr.photos.search(privacy_filter = 1, accuracy = 16, lat=df.loc[x,'lat'], lon=df.loc[x,'long'], radius = rad, format= "json", nojsoncallback = 1)
    hexpics = json.loads(hex_pics_json)
    print(hexpics["photos"])
    print (hexpics["photos"]["total"])
    print(hexpic(df.loc[x,'lat'], df.loc[x,'long'], rad))

    
def setup():
    df_loc = input("Enter hex shapefile directory : ")
    cityhex = gpd.read_file(df_loc)
    crs = input("Enter CRS EPSG # : ")
    crs = 'epsg:' + crs
    cityhex = cityhex.to_crs({'init': crs}) 
    cityhex = centroid_coord(cityhex)
    return cityhex

def makeshp(cityhex):
    hexrad = input("Enter hex radius in km : ")
    init = int(input("Initial row : "))
    fin = input("Final row (for last row enter 'last'): ")
    if fin == 'last':
        fin = fin
    else:
        fin = int(fin)+1
    cityhex = hydrate_hex(cityhex, hexrad, init, fin)
    return cityhex
   ## save = input("Enter output shapefile name (no extension)")
   ## save = save + '.shp'
    ##cityhex.to_file(driver = 'ESRI Shapefile', filename = save)
   ## print('Process terminated')
    

def exportjson(hexfile):
    hexfile=hexfile.drop(columns=['left','right','top','bottom','lat','long','id'])
    hexfile=hexfile.to_crs({'init': 'epsg:4326'})
    save = input("Enter output shapefile name (no extension)")
    save = save + '.geojson'
    hexfile.to_file(driver = 'GeoJSON', filename = save)
    text = 'Process terminated ' + save + ' saved to directory.'
    print(text)


def joinjson():
    firstfile = input("Enter first shapefile (no ext)")
    firstfile = firstfile + '.geojson'
    first = gpd.read_file(firstfile)
    first = first.to_crs({'init': 'epsg:4326'})
    done='n'
    while done=='n':
        addifile = input("Enter additional shapefile (no ext, '.' for termination)")
        if addifile =='.':
            done = 'y'
            break
        else: 
            done=done
        addifile = addifile+'.geojson'
        addi = gpd.read_file(addifile)
        addi = addi.to_crs({'init': 'epsg:4326'})
        first = first.append(addi)   
    save = input("Enter output shapefile name (no extension)")
    save = save + '.geojson'
    first.to_file(driver = 'GeoJSON', filename = save)
    text = 'Process terminated ' + save + ' saved to directory.'
    print(text)
    
    
    
    
    
