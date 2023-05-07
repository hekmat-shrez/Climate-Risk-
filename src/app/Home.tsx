'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { climate_risks } from '../../climate_risk2';
import { climate_risk } from '../../climate_risk';
import dynamic from 'next/dynamic';
import Table from './table';
import Multiselect from 'multiselect-react-dropdown';
import Graph from './graph';
import { Label } from 'flowbite-react';

let max = 0;
let min = climate_risks[0].year;

climate_risks.forEach((e) => {
  if (min > e.year) min = e.year;
  if (max < e.year) max = e.year;
});

const options_risk_rate = [...Array(9)].map((_, i) => {
  return i + 1 / 10;
});

console.log('min and max ', min, ' ', max);
let numOfDecade = (max - min) / 10;

let decade_option = Array.from({ length: numOfDecade + 1 }).map((_, i) => {
  return i === 0 ? (
    <option key={i} value={min}>
      {min}
    </option>
  ) : (
    <option key={i} value={(min += 10)}>
      {min}
    </option>
  );
});

// risk_factor keys
const risk_factor_key = climate_risks.reduce((options: string[], item) => {
  if (item.risk_factor) {
    Object.keys(item.risk_factor).forEach((factor) => {
      if (!options.includes(factor)) {
        options.push(factor);
      }
    });
  }
  return options;
}, []);

const Home = () => {
  const Map = dynamic(() => import('./map'), {
    ssr: false,
  });

  const [selectedValue, setSelectedValue] = useState(2030);
  const [selectedMarker, SetSelectedMarker] = useState<[number, number] | null>(
    null
  );
  const [isMarkerSelected, SetIsMarkerSelected] = useState<boolean>(true);

  let data: climate_risk[] = [];
  // Selected year.
  data = climate_risks
    .filter((element) => element.year === Number(selectedValue))
    .map((element) => element);

  const [filters, setFilters] = useState<{
    location: string;
    year: string;
    asset_name: string;
    business_category: string;
    risk_rate: string;
    risk_factor: string[] | string;
  }>({
    location: '',
    year: '',
    asset_name: '',
    business_category: '',
    risk_rate: '',
    risk_factor: '',
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    if (value === '0') {
      setFilters((prevFilters) => ({ ...prevFilters, [key]: '' }));
    } else {
      setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    }
  };

  const filteredData = climate_risks.filter((d) => {
    let matchesYearFilter = true;
    // if (filters.year) {
    //   matchesYearFilter = d.year !== 0
    // }
    // let matchesYearFilter = true;
    if (filters.year && filters.year !== '') {
      matchesYearFilter = d.year === parseInt(filters.year);
    }

    // if (selectedYear !== 0) {
    //     matchesYearFilter = d.year === selectedYear;
    //   }
    let matchlatFilter = true;
    let matchlongFilter = true;
    if (filters.location && filters.location !== '') {
      let templatlng = JSON.parse(filters.location);
      matchlatFilter = d.lat === templatlng[0];
      matchlongFilter = d.long === templatlng[1];

      //matchlatlngFilter = `[${d.lat}, ${d.long}]`.toLowerCase().includes(filters.location.toLowerCase);
    }

    let matchesAssetNameFilter = true;
    if (filters.asset_name) {
      matchesAssetNameFilter = d.asset_name
        .toLowerCase()
        .includes(filters.asset_name.toLowerCase());
    }

    let matchesBusinessCategoryFilter = true;
    if (filters.business_category) {
      matchesBusinessCategoryFilter = d.business_category
        .toLowerCase()
        .includes(filters.business_category.toLowerCase());
    }

    let matchesRiskRatingFilter = true;
    if (filters.risk_rate) {
      console.log('filter risk rate change: ', filters.risk_rate);
      matchesRiskRatingFilter = Number(filters.risk_rate) <= d.risk_rate;
      /*.toString()
          .toLowerCase()
          .includes(filters.risk_rate.toLowerCase());*/
    }

    let matchesRiskFactorsFilter = true;
    if (filters.risk_factor.length > 0) {
      const assetFactors = Object.keys(d.risk_factor || {});

      //const allFilterFactorsPresent = Array.from(filters.risk_factor).every(f => assetFactors.includes(f));

      const allFilterFactorsPresent =
        assetFactors.sort().toString() ===
        Array.from(filters.risk_factor).sort().toString();

      if (!allFilterFactorsPresent) {
        return false;
      }
    }
    return (
      matchlatFilter &&
      matchlongFilter &&
      matchesYearFilter &&
      matchesAssetNameFilter &&
      matchesBusinessCategoryFilter &&
      matchesRiskRatingFilter &&
      matchesRiskFactorsFilter
    );
  });

  // Risk Factor Select
  function onSelect(selectedList: string, selectedItem: string) {
    handleFilterChange('risk_factor', selectedList);
  }
  // Risk Factor unSelect
  function onRemove(selectedList: string, removedItem: string) {
    handleFilterChange('risk_factor', selectedList);
  }

  // Handle the marker selection.
  function handleMarkerClick(latlng: [number, number] | null) {
    if (!isMarkerSelected) {
      handleFilterChange('location', '');
      SetIsMarkerSelected(true);
    } else {
      handleFilterChange('location', JSON.stringify(latlng));
      SetSelectedMarker(latlng);
      SetIsMarkerSelected(false);
    }
  }
  console.log('isMarkerSelected: ', isMarkerSelected);

  return (
    <>
      <div id="map-graph-container">
        <div id="map">
          <div id="selectYear">
            <select
              id="years"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(e) => handleFilterChange('year', e.target.value)}
              value={filters.year}
            >
              <option value="">All years</option>
              {decade_option}
            </select>
          </div>
          <div id="map-legend">
            <span>{'risk rate < 35'}</span>
            <span>{'risk rate > 35 and risk rate < 75'}</span>
            <span>{'risk rate > 75'}</span>
          </div>
          <Map data={filteredData} onMarkerClick={handleMarkerClick} />
        </div>
        <div id="graph">
          <Graph data={filteredData}></Graph>
        </div>
      </div>

      <div id="table">
        <div className="filters">
          <div className="filter">
            <label htmlFor="year-select">Filter by year:</label>
            <select
              id="year-select"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              <option value="">All years</option>
              {decade_option}
              ))
            </select>
          </div>

          <div className="filter">
            <label htmlFor="asset-select">Filter by asset name:</label>
            <select
              id="asset-select"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={filters.asset_name}
              onChange={(e) => handleFilterChange('asset_name', e.target.value)}
            >
              <option value="">All assets</option>
              {data
                .reduce((options: string[], item) => {
                  if (!options.includes(item.asset_name)) {
                    options.push(item.asset_name);
                  }
                  return options;
                }, [])
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
          <div className="filter">
            <label htmlFor="category-select">
              Filter by business category:
            </label>
            <select
              id="category-select"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={filters.business_category}
              onChange={(e) =>
                handleFilterChange('business_category', e.target.value)
              }
            >
              <option value="">All categories</option>
              {data
                .reduce((options: string[], item) => {
                  if (!options.includes(item.business_category)) {
                    options.push(item.business_category);
                  }
                  return options;
                }, [])
                .map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>

          <div className="filter">
            <label htmlFor="risk-rating-select">Filter by risk rating</label>
            <select
              id="risk-rating-select"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={filters.risk_rate}
              onChange={(e) => handleFilterChange('risk_rate', e.target.value)}
            >
              {data
                .reduce((options: string[], item) => {
                  if (!options.includes(item.risk_rate.toString())) {
                    options.push(item.risk_rate.toString());
                  }
                  return options.sort();
                }, [])
                .map(
                  (option, index) =>
                    index % 10 === 0 && (
                      <option key={option} value={option}>
                      {index === 0 ? "All risk rates" : option + " >"} 
                      </option>
                    )
                )}
            </select>
          </div>
          <div className="filter" id="filter">
            <Multiselect
              isObject={false}
              options={risk_factor_key} // Options to display in the dropdown
              selectedValues={selectedValue} // Preselected value to persist in dropdown
              onSelect={onSelect} // Function will trigger on select event
              onRemove={onRemove} // Function will trigger on remove event
              showCheckbox={true}
              placeholder="Filter by Risk Factor"
            />
          </div>
        </div>
        <Table data={filteredData} />
      </div>
    </>
  );
};

export default Home;
