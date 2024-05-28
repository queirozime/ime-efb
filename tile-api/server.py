from flask import Flask, send_file, abort
import os

app = Flask(__name__)

@app.route('/<path:file_path>', methods=['GET'])
def download_file(file_path):
    # Construct the full file path
    full_path = os.path.join('public', file_path)
    
    # Check if the file exists
    if not os.path.isfile(full_path):
        abort(404, description="File not found")
    
    try:
        # Send the file as an attachment
        return send_file(full_path, as_attachment=False)
    except Exception as e:
        abort(500, description=str(e))
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

