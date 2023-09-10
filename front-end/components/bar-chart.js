"use client"

import React, { useState, useEffect } from 'react';
import { Card, Title, Text, BarChart } from "@tremor/react";

export const BoxChartExample = () => {
    const [chartdata, setChartData] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:5000/bar_chart?dataset=edinburgh')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setChartData(data);
                console.log(data);

            })
            .catch(error => {
                console.log('There was a problem with the fetch operation:', error.message);
            });
    }, []);

    return (
        <>
            <Title>Most Popular Cycling Locations</Title>
            <Text>Top locations based on cycling activity count.</Text>
            <BarChart
                className="h-80 mt-6"
                data={chartdata}
                category="name"
                value="ActivityCount"
                categories={["ActivityCount"]}
                index="name"
            />
        </>
    );
};
