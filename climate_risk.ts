export interface climate_risk  {
    asset_name: string;
    lat: number;
    long: number;
    business_category: string;
    risk_rate: number;
    risk_factor: {[key: string]: number};
    year: number;
};