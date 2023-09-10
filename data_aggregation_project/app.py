from flask import Flask, jsonify, request
from datetime import datetime
import pandas as pd
from flask_cors import CORS
from collections import defaultdict
from statistics import median
from sklearn.neighbors import NearestNeighbors
import numpy as np
import networkx as nx
from scipy.spatial import distance

app = Flask(__name__)
CORS(app)

# Load datasets
datasets = {
    "edinburgh": pd.read_csv("edinburgh.csv"),
    "john_muir_way": pd.read_csv("john-muir-way.csv"),
    "glasgow": pd.read_csv("glasgow.csv")
}
datasets["all"] = pd.concat(
    [datasets["edinburgh"], datasets["john_muir_way"], datasets["glasgow"]], ignore_index=True)


@app.route('/')
def index():
    return "Welcome to the Data Aggregation API!"

# Helper Functions


def get_dataset(dataset_name):
    return datasets.get(dataset_name, datasets['edinburgh'])


def filter_by_year(data, year):
    if year and year != "all":
        data = data[pd.to_datetime(data['startTime']).dt.year == int(year)]
    return data


def get_aggregated_data(data, column_name):
    aggregated_data = data.groupby(column_name).agg(
        {'count': 'sum'}).reset_index()
    return aggregated_data

# Routes


@app.route('/nearest_paths', methods=['GET'])
def nearest_paths():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    data = filter_by_year(data, request.args.get('year', 'all'))
    # Get unique coordinates
    coords = data[['latitude', 'longitude']].drop_duplicates().values

    # Create a complete graph
    G = nx.complete_graph(len(coords))

    # Assign distances as edge weights
    for i in range(len(coords)):
        for j in range(len(coords)):
            if i != j:
                dist = distance.euclidean(coords[i], coords[j])
                G[i][j]['weight'] = dist

    # Compute the minimum spanning tree
    mst = nx.minimum_spanning_tree(G)

    paths = []
    for edge in mst.edges():
        paths.append({
            'start': coords[edge[0]].tolist(),
            'end': coords[edge[1]].tolist()
        })

    return jsonify(paths)


@app.route('/years', methods=['GET'])
def years():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    data['year'] = pd.to_datetime(data['startTime']).dt.year
    unique_years = data['year'].unique().tolist()

    return jsonify(unique_years)


@app.route('/scatter_data', methods=['GET'])
def scatter_data():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    # get the year query parameter with default as 'all'
    year = request.args.get('year', 'all')
    data = filter_by_year(data, year)  # filter by year

    # Rounding off coordinates to ensure more consistent data
    data['latitude'] = data['latitude'].round(4)
    data['longitude'] = data['longitude'].round(4)

    location_data = data.groupby(['latitude', 'longitude']).agg({
        'count': 'sum'}).reset_index()

    chart_data = [{
        "id": f"{row['latitude']},{row['longitude']}",  # unique identifier
        "x": row['latitude'],
        "y": row["longitude"],
        "value": row["count"]
    } for _, row in location_data.iterrows()]

    return jsonify(chart_data)


@app.route('/time_series_counts', methods=['GET'])
def time_series_counts():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    # get the year query parameter with default as 'all'
    year = request.args.get('year', 'all')
    data = filter_by_year(data, year)  # filter by year
    # Extracting date from the startTime
    data['date'] = pd.to_datetime(data['startTime']).dt.date
    time_series_data = data.groupby('date').agg({'count': 'sum'}).reset_index()

    chart_data = [{"name": str(row['date']), "ActivityCount": int(row["count"])}
                  for _, row in time_series_data.iterrows()]
    return jsonify(chart_data)


@app.route('/unique_coordinates', methods=['GET'])
def unique_coordinates():
    dataset = request.args.get('dataset', 'edinburgh')
    # Default to None if location is not provided
    filter_location = request.args.get('location', None)
    data = get_dataset(dataset)
    # get the year query parameter with default as 'all'
    year = request.args.get('year', 'all')
    data = filter_by_year(data, year)  # filter by year

    # Filter by location if provided
    if filter_location:
        data = data[data['location'] == filter_location]

    # Group by coordinates and location to get counts
    grouped_data = data.groupby(
        ['latitude', 'longitude', 'location']).size().reset_index(name='counts')

    # Calculate median value
    median_value = median(grouped_data['counts'])

    # Adjust counts relative to the median and ensure they are integers by rounding
    grouped_data['adjusted_counts'] = grouped_data['counts'].apply(
        lambda x: round((x / median_value) * 10) if median_value != 0 else x)

    # Convert to dictionary format
    records = grouped_data[['latitude', 'longitude',
                            'location', 'adjusted_counts']].to_dict(orient='records')

    return jsonify(records)


@app.route('/daily_counts', methods=['GET'])
def daily_counts():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    data = filter_by_year(data, request.args.get('year', 'all'))
    data['day_of_week'] = pd.to_datetime(data['startTime']).dt.day_name()
    aggregated_data = get_aggregated_data(data, 'day_of_week')
    chart_data = [{"name": row["day_of_week"], "ActivityCount": row["count"]}
                  for _, row in aggregated_data.iterrows()]
    return jsonify(chart_data)


@app.route('/location_counts', methods=['GET'])
def bar_chart():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    # get the year query parameter with default as 'all'
    year = request.args.get('year', 'all')
    data = filter_by_year(data, year)  # filter by year
    aggregated_data = data.groupby('location').agg(
        {'count': 'sum'}).reset_index()
    top_data = aggregated_data.nlargest(10, 'count')

    chart_data = [{"name": row["location"], "ActivityCount": row["count"]}
                  for _, row in top_data.iterrows()]
    return jsonify(chart_data)


@app.route('/day_counts', methods=['GET'])
def day_of_year_counts():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    # get the year query parameter with default as 'all'
    year = request.args.get('year', 'all')
    data = filter_by_year(data, year)  # filter by year
    data['month'] = pd.to_datetime(data['startTime']).dt.month
    data['day'] = pd.to_datetime(data['startTime']).dt.day

    day_data = data.groupby(['month', 'day']).agg(
        {'count': 'sum'}).reset_index()
    top_10_day_data = day_data.sort_values(
        by='count', ascending=False).head(10)

    chart_data = [{"name": f"{row['month']}/{row['day']}",
                   "ActivityCount": int(row["count"])} for _, row in top_10_day_data.iterrows()]
    return jsonify(chart_data)


@app.route('/hourly_counts', methods=['GET'])
def hourly_counts():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    # get the year query parameter with default as 'all'
    year = request.args.get('year', 'all')
    data = filter_by_year(data, year)  # filter by year

    # Extracting hour from the startTime
    data['hour_of_day'] = pd.to_datetime(data['startTime']).dt.hour

    # Aggregating data by hour_of_day
    aggregated_data = data.groupby('hour_of_day').agg(
        {'count': 'sum'}).reset_index()

    # Adding missing hours
    all_hours = set(range(24))
    existing_hours = set(aggregated_data['hour_of_day'])
    missing_hours = all_hours - existing_hours
    missing_data = pd.DataFrame({'hour_of_day': list(
        missing_hours), 'count': [0] * len(missing_hours)})
    aggregated_data = pd.concat(
        [aggregated_data, missing_data], ignore_index=True)

    # Sorting data and taking top 5
    top_5_data = aggregated_data.sort_values(
        by='count', ascending=False).head(5)

    # Creating chart data
    chart_data = [{"name": f"{int(row['hour_of_day'])} - {int(row['hour_of_day']) + 1 if int(row['hour_of_day']) != 23 else 0}",
                   "ActivityCount": int(row["count"])} for _, row in top_5_data.iterrows()]

    return jsonify(chart_data)


@app.route('/monthly_counts', methods=['GET'])
def monthly_counts():
    data = get_dataset(request.args.get('dataset', 'edinburgh'))
    data['month'] = pd.to_datetime(data['startTime']).dt.month
    # get the year query parameter with default as 'all'
    year = request.args.get('year', 'all')
    data = filter_by_year(data, year)  # filter by year

    month_data = data.groupby('month').agg({'count': 'sum'}).reset_index()
    top_10_month_data = month_data.sort_values(
        by='count', ascending=False).head(10)

    month_names = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April',
        5: 'May', 6: 'June', 7: 'July', 8: 'August',
        9: 'September', 10: 'October', 11: 'November', 12: 'December'
    }
    chart_data = [{"name": month_names[row['month']], "ActivityCount": int(
        row["count"])} for _, row in top_10_month_data.iterrows()]
    return jsonify(chart_data)


if __name__ == '__main__':
    app.run(debug=True)
