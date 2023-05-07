'use client';
import { climate_risk } from '../../climate_risk';
import { useState, useEffect } from 'react';

import { Table, Label, Pagination } from 'flowbite-react';

interface Props {
  data: climate_risk[];
}

function handleCount() {
  alert('toggle changed');
}

const Tables: React.FC<Props> = ({ data }) => {
  const [tableData, setTableData] = useState<climate_risk[]>(data);
  const [isSorted, setIsSorted] = useState(false);

  function handleSort(columnName: string) {
    let newData: climate_risk[] = [];

    if (columnName === 'asset_name') {
      if (!isSorted) {
        newData = [...data].sort((a, b) => {
          if (a.asset_name < b.asset_name) {
            return -1;
          } else if (a.asset_name > b.asset_name) {
            return 1;
          } else {
            return 0;
          }
        });

        setTableData(newData);
        setIsSorted(true);
      } else {
        setTableData(data);
        setIsSorted(false);
      }
    }
    if (columnName === 'risk_rate') {
      if (!isSorted) {
        newData = [...data].sort((a, b) => a.risk_rate - b.risk_rate);
        setTableData(newData);
        setIsSorted(true);
      } else {
        setTableData(data);
        setIsSorted(false);
      }
    }
    if (columnName === 'business_category') {
      if (!isSorted) {
        newData = [...data].sort((a, b) => {
          if (a.business_category < b.business_category) {
            return -1;
          } else if (a.business_category > b.business_category) {
            return 1;
          } else {
            return 0;
          }
        });

        setTableData(newData);
        setIsSorted(true);
      } else {
        setTableData(data);
        setIsSorted(false);
      }
    }
  }

  useEffect(() => {
    if (data.length) {
      setTableData(data);
    } else {
      setTableData(tableData);
    }
  }, [data]);

  const itemsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  function onPageChange(page: number) {
    setCurrentPage(page);
  }
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = tableData.slice(startIndex, endIndex);

  return (
    <>
      <div id="table">
        <Table striped={true}>
          <Table.Head>
            <Table.HeadCell className="cursor-pointer" onClick={() => handleSort('asset_name')}>
              Asset Name
            </Table.HeadCell>
            <Table.HeadCell>Lat</Table.HeadCell>
            <Table.HeadCell>Long</Table.HeadCell>
            <Table.HeadCell className="cursor-pointer" onClick={() => handleSort('business_category')}>
              business category
            </Table.HeadCell>
            <Table.HeadCell  className="cursor-pointer" onClick={() => handleSort('risk_rate')}>
              Risk Rate
            </Table.HeadCell>
            <Table.HeadCell>Risk Factor</Table.HeadCell>
            <Table.HeadCell>Year</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {tableData.length > 0 ? (
              currentItems.map((row, index) => (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {row.asset_name}
                  </Table.Cell>
                  <Table.Cell>{row.lat}</Table.Cell>
                  <Table.Cell>{row.long}</Table.Cell>
                  <Table.Cell>{row.business_category}</Table.Cell>
                  <Table.Cell>{row.risk_rate}</Table.Cell>
                  <Table.Cell>
                    {Object.keys(row.risk_factor).map(
                      (key, index) => `${key}: ${row.risk_factor[key]},    `
                    )}
                  </Table.Cell>
                  <Table.Cell>{row.year}</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <h1>No data found</h1>
            )}
          </Table.Body>
        </Table>
        <div id="pagination">
          <Pagination
            currentPage={currentPage}
            onPageChange={onPageChange}
            showIcons={true}
            totalPages={totalPages}
          />
        </div>
      </div>
    </>
  );
};

export default Tables;
