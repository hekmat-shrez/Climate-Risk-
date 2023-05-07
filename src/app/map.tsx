'use client';
import { climate_risks } from '../../climate_risk2';
import { climate_risk } from '../../climate_risk';
import * as Leaflet from 'leaflet';
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import Graph from './graph';

interface Props {
  data: climate_risk[];
  onMarkerClick: (latlng: [number, number] | null) => void;
}

const Map: React.FC<Props> = ({ data, onMarkerClick }) => {
  const [selectedLocation, setSelectedLocation] = useState<number[]>();

  function handleClick(lat: number, long: number) {
    if (
      !selectedLocation ||
      ![lat, long].every((val, idx) => val === selectedLocation[idx])
    ) {
      onMarkerClick([lat, long]);
      setSelectedLocation([lat, long]);
    } else {
      onMarkerClick(null);
      setSelectedLocation(undefined);
    }
  }

  const memoizedMap = useMemo(() => {
    return (
      <>
        <MapContainer
          className="h-full w-11/12"
          center={[51.2538, -85.3232]}
          zoom={4}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {data.map((marker, index) => (
            <Marker
              key={index}
              position={[marker.lat, marker.long]}
              icon={
                new Leaflet.Icon({
                  iconUrl: `marker-${
                    marker.risk_rate < 0.7 && marker.risk_rate > 0.35
                      ? '35'
                      : marker.risk_rate > 0.75
                      ? '75'
                      : '0'
                  }.png`,
                  iconSize: [48, 48],
                  iconAnchor: [16, 16],
                  popupAnchor: [0, -16],
                })
              }
              eventHandlers={{
                click: () => handleClick(marker.lat, marker.long),
              }}
            >
              <Tooltip>
                Asset Name: {marker.asset_name}
                <br></br>
                Business Catergory: {marker.business_category}
                <br></br>
                Risk Rate: {marker.risk_rate}
                <br></br>
                Year: {marker.year}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </>
    );
  }, [data]);

  return <>{memoizedMap}</>;
};

export default Map;
