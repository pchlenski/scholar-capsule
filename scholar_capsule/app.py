from flask import Flask, render_template, request, jsonify
from scholarly import scholarly
import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
        query = data.get('query')
        timestamp = data.get('timestamp')  # Format: YYYY-MM-DD
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        # Get the current date if timestamp is not provided
        if not timestamp:
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d')
        
        # Parse the timestamp to a datetime object
        target_date = datetime.datetime.strptime(timestamp, '%Y-%m-%d')
        
        # Search for author
        search_query = scholarly.search_author(query)
        author = next(search_query)
        
        # Get the complete author details
        author_details = scholarly.fill(author)
        
        # Filter publications based on timestamp
        filtered_publications = []
        for pub in author_details.get('publications', []):
            pub_details = scholarly.fill(pub)
            
            # Get publication year
            pub_year = pub_details.get('bib', {}).get('pub_year')
            if not pub_year:
                continue
            
            # Convert to datetime for comparison
            try:
                pub_date = datetime.datetime(int(pub_year), 1, 1)
                if pub_date <= target_date:
                    # Remove citations that are after the target date
                    filtered_citations = 0
                    for citation in pub_details.get('citations', []):
                        citation_year = citation.get('bib', {}).get('pub_year')
                        if citation_year and datetime.datetime(int(citation_year), 1, 1) <= target_date:
                            filtered_citations += 1
                    
                    pub_details['num_citations'] = filtered_citations
                    filtered_publications.append(pub_details)
            except (ValueError, TypeError):
                # Skip publications with invalid years
                continue
        
        # Replace the author's publications with filtered ones
        author_details['publications'] = filtered_publications
        
        # Recalculate citation metrics based on filtered publications
        total_citations = sum(pub.get('num_citations', 0) for pub in filtered_publications)
        author_details['citedby'] = total_citations
        
        return jsonify(author_details)
    
    except StopIteration:
        return jsonify({"error": "Author not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)