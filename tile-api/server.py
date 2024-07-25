from flask import Flask, send_file, abort
import math
import requests
import os
from PIL import Image
from io import BytesIO

app = Flask(__name__)

@app.route('local/<path:file_path>', methods=['GET'])
def download_file(file_path):
    full_path = os.path.join('public', file_path)
    
    if not os.path.isfile(full_path):
        abort(404, description="File not found")
    
    try:
        return send_file(full_path, as_attachment=False)
    except Exception as e:
        abort(500, description=str(e))

@app.route('/<path:file_path>', methods=['GET'])
def request_tile(file_path):
    string = file_path.replace('.png', '')
    
    values = string.split('/')
    z = int(values[0])
    x = int(values[1])
    y = int(values[2])

    app.logger.info(f"z: {z}, x: {x}, y: {y}")

    def tile2lon(x, z):
        return x / (2 ** z) * 360.0 - 180

    def tile2lat(y, z):
        n = math.pi - 2.0 * math.pi * y / (2 ** z)
        return (180.0 / math.pi * math.atan(0.5 * (math.exp(n) - math.exp(-n))))

    def get_bbox(x, y, z):
        min_lon = tile2lon(x, z)
        min_lat = tile2lat(y + 1, z)
        max_lon = tile2lon(x + 1, z)
        max_lat = tile2lat(y, z)
        return f"{min_lon},{min_lat},{max_lon},{max_lat}"

    def get_tile_url(x, y, z):
        bbox = get_bbox(x, y, z)
        app.logger.info(f"bbox: {bbox}")
        url_template = (
            "https://bdgex.eb.mil.br/mapcache?"
            "SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1"
            "&LAYERS=rapideye"
            "&STYLES="
            "&SRS=EPSG:4326"
            f"&BBOX={bbox}"
            "&WIDTH=161&HEIGHT=883"
            "&FORMAT=image/png"
        )
        return url_template


    def fetch_wms_tile(x, y, z):
        url = get_tile_url(x, y, z)
        app.logger.info(f"Fetching map tile: {url}")
        response = requests.get(url)
        if response.status_code == 200:
            image = Image.open(BytesIO(response.content))
            img_io = BytesIO()
            image.save(img_io, 'PNG')
            img_io.seek(0)
            try:
                return send_file(img_io, mimetype='image/png')
            except Exception as e:
                abort(500, description=str(e))
                
        else:
            print(f"Failed to retrieve map tile: {response.status_code}")

    return fetch_wms_tile(x, y, z)  
    
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

