"use client";

import {
  Card, Grid, Tab, TabGroup, TabList, TabPanel, TabPanels,
} from "@tremor/react";
import { BarListExample } from "../components/bar-list"
import Header from "../components/header"
import MapComponent from '../components/map'
import { useState } from 'react'
import { TimeSeriesChart } from "../components/time-series-chart";

function BarListCard({ endpoint, title, x, y, dataset, year }) {
  return (
    <Card>
      <BarListExample
        endpoint={endpoint}
        title={title}
        x={x}
        y={y}
        dataset={dataset}
        year={year}
      />
    </Card>
  );
}

export default function DashboardExample() {
  const [selectedDataset, setSelectedDataset] = useState('edinburgh');
  const [selectedYear, setSelectedYear] = useState('all');

  return (
    <main className="p-12">
      <Card>
        <Header
          dataset={selectedDataset}
          selectedButton={selectedDataset}
          setSelectedButton={setSelectedDataset}
          setSelectedYear={setSelectedYear}
          selectedYear={selectedYear}
        />
      </Card>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Locations</Tab>
          <Tab>Top</Tab>
          <Tab>Time Series</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card className="mt-6">
              <MapComponent
                dataset={selectedDataset}
                showLineLayer={true}
                showHexagonLayer={true}
                show3DLayer={false}
                year={selectedYear}
              />
            </Card>
          </TabPanel>
          <TabPanel>
            <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
              <BarListCard endpoint="location_counts" title="Locations" x="Location" y="Activity Count" dataset={selectedDataset} year={selectedYear} />
              <BarListCard endpoint="daily_counts" title="Day of the Week" x="Day of Week" y="Activity Count" dataset={selectedDataset} year={selectedYear} />
              <BarListCard endpoint="day_counts" title="Day of the year" x="Day" y="ActivityCount" dataset={selectedDataset} year={selectedYear} />
              <BarListCard endpoint="monthly_counts" title="Month of the Year" x="Month" y="ActivityCount" dataset={selectedDataset} year={selectedYear} />
              <BarListCard endpoint="hourly_counts" title="Hour of Day" x="Hour" y="ActivityCount" dataset={selectedDataset} year={selectedYear} />
            </Grid>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <TimeSeriesChart
                endpoint="time_series_counts"
                title="Activity Counts Over Time"
                dataset={selectedDataset}
                year={selectedYear}
              />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}
