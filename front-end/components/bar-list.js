import React, { useState, useEffect } from 'react';
import { BarList, Card, Title, Bold, Flex, Text } from "@tremor/react";

export const BarListExample = ({
    base_url = 'http://127.0.0.1:5000/',
    endpoint,
    title,
    x,
    y,
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
                    name: item.name,
                    value: item.ActivityCount,
                }));
                setChartData(formattedData);
            });
    }, [base_url, endpoint, dataset]);

    return (
        <>
            <Title>{title || ''}</Title>
            {/* <Flex className="mt-4"> */}
            {/* <Text>
                    <Bold>{x || ''}</Bold>
                </Text> */}
            {/* <Text>
                    <Bold>{y || ''}</Bold>
                </Text> */}
            {/* </Flex> */}
            <BarList data={chartData} className="mt-2" />
        </>
    );
};

export default BarListExample;
