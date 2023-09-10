"use client"

import React, { useState, useEffect } from 'react';
import { Card, Title, DonutChart, Text } from "@tremor/react";

export const DonutChartExample = () => {
    const [chartdata, setChartData] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/bar_chart?dataset=edinburgh')
            .then(response => response.json())
            .then(data => {
                setChartData(data);
            });
    }, []);

    const valueFormatter = (number) => number.toString();

    return (
        <>
            <Title>Most Popular Cycling Locations</Title>
            <Text>Distribution of cycling activities by location.</Text>
            <DonutChart
                className="mt-6"
                data={chartdata}
                category="ActivityCount"
                index="name"
                valueFormatter={valueFormatter}
                colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]} // Add more colors if needed
            />
        </>
    );
};

export default DonutChartExample;
