from flask import Flask, send_file, abort, request
from flask_caching import Cache
import math
import requests
import os
from PIL import Image
from io import BytesIO
import xml.etree.ElementTree as ET
import json

config = {
    "DEBUG": True,
    "CACHE_TYPE": "SimpleCache",
    "CACHE_DEFAULT_TIMEOUT": 86400
}

app = Flask(__name__)
app.config.from_mapping(config)
cache = Cache(app)

@app.route('/local/<path:file_path>', methods=['GET'])
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
    layer = request.args.get('layer')
    
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
            f"&LAYERS={layer or 'ctm250'}"
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
    
@app.route('/layers', methods=['GET'])
def getLayers():
    url = "https://bdgex.eb.mil.br/mapcache?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.1.1"
    response = requests.get(url)
    if response.status_code == 200:
        root = ET.fromstring(response.text)
        layers_list = []
        for tileset in root.findall(".//TileSet"):
            layers = tileset.find("Layers")
            srs = tileset.find("SRS")
            if layers is not None and srs is not None:
                layers_list.append({"name": layers.text, "srs": srs.text})

        return json.dumps(layers_list)
    else:
        abort(500, description="Failed to retrieve layers")
    
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

