import { useEffect, Fragment, useState } from 'react';
import {
    CalendarIcon,
    ChevronDownIcon,
    LinkIcon,
} from '@heroicons/react/20/solid';

function Button({ selected, value, setSelectedButton }) {
    return (
        <span className="ml-3 w-1/2 sm:w-auto sm:mr-4 mb-4 sm:mb-0">
            <button
                type="button"
                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 min-w-32 ${selected === value ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus:bg-indigo-500 focus-visible:ring-indigo-600' : 'bg-white text-gray-900 hover:bg-gray-50'
                    }`}
                onClick={() => setSelectedButton(value)}
            >
                <LinkIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                <span className="capitalize">{value}</span>
            </button>
        </span>
    );
}

export default function Header({
    dataset,
    selectedButton,
    setSelectedButton,
    setSelectedYear,
    selectedYear
}) {
    const [years, setYears] = useState([]);

    useEffect(() => {
        fetch(`http://127.0.0.1:5000/years?dataset=${selectedButton}`)
            .then(response => response.json())
            .then(data => {
                const sortedYears = data.sort((a, b) => a - b);
                setYears(sortedYears);
            });
    }, [selectedButton]);

    return (
        <div className="lg:flex lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
                <h2 className="capitalize text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    {dataset && dataset.replace(/_/g, ' ')}
                </h2>
                <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                        <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        {years.join(', ')}
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap lg:ml-4 lg:mt-0">
                {['edinburgh', 'john_muir_way', 'glasgow', 'all'].map(value => (
                    <Button
                        key={value}
                        selected={selectedButton}
                        value={value}
                        setSelectedButton={setSelectedButton}
                    />
                ))}
            </div>

        </div>
    );
}
