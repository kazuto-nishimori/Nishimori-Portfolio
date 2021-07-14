"""
Written by Nathan Wies
1/11/20

Code storing keys to avoid security issues when accessing api
Keys are for nwies user account associated with nwies@u.rochester.edu
"""
import flickr_api as flickr


##API_KEY = '1f3f0862b85b2e9b17a39aa101418d7c'
##SECRET_KEY = '794943c74d48f80c'
API_KEY = 'b7f5fd162bfad0c6557b5b56c8337d86'
SECRET_KEY = 'c66d3ab84d91613d'
flickr.set_keys(api_key=API_KEY, api_secret= SECRET_KEY) 

