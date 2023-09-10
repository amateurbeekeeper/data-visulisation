import React, { useState, useEffect } from 'react';
import { LineChart, Card, Title, Flex, Bold, Text, Grid } from "@tremor/react";

export const TimeSeriesChart = ({
    base_url = 'http://127.0.0.1:5000/',
    endpoint,
    title,
    x,  // This prop is not used in the LineChart component, but kept for consistency
    y,  // This prop is not used in the LineChart component, but kept for consistency
    dataset,
    year
}) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const constructedURL = `${base_url}${endpoint}?dataset=${dataset}&year=${year}`;

        fetch(constructedURL)
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    date: item.name,
                    "Activity Count": item.ActivityCount,
                }));
                setChartData(formattedData);
            });
    }, [base_url, endpoint, dataset]);

    const dataFormatter = value => value.toFixed(2);

    return (
        <>
            <Card className="mt-4">
                <Title>{title || ''}</Title>
                {/* <Text className="mt-4">
                    Monitoring trends over time can help policymakers or businesses identify patterns, such as increased foot traffic during specific events or seasons. This can aid in planning events, allocating resources, or making decisions about business hours.
                </Text> */}
                <Flex className="mt-4">
                    <Text>
                        <Bold>{x || ''}</Bold>
                    </Text>
                    <Text>
                        <Bold>{y || ''}</Bold>
                    </Text>
                </Flex>
                <LineChart
                    className="mt-6"
                    data={chartData}
                    index="date"
                    categories={["Activity Count"]}
                    colors={["blue"]}
                    valueFormatter={dataFormatter}
                    yAxisWidth={40}
                />
            </Card>
            <div className="">

            </div>
        </>

    );
};

export default TimeSeriesChart;
