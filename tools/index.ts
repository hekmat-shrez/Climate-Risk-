
import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse';

type Risk_Factor = {
  risk_factor : {[key: string]: number};
};

type Data = {
  asset_name: string;
  lat: number;
  long: number;
  business_category: string;
  risk_rate: number;
  risk_factor: string;
  year: number;
};

//(() => {
  const csvFilePath = path.resolve(__dirname, 'csv_data.csv');
  
  const headers = ['asset_name', 'lat', 'long', 'business_category', 'risk_rate','risk_factor', 'year'];
  
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  
  
  parse(fileContent, {
    delimiter: ',',
    columns: headers,
  }, (error, result: Data[]) => {
    if (error) {
      console.error(error);
    }
    //console.log(result);
  

    const output = path.resolve(__dirname, 'climate_risk.ts');

    const writeStream= fs.createWriteStream(output, {flags: 'w'});

    writeStream.write("import { climate_risk } from './data';\n\nexport const data: Array<Data> = [\n");

    result.forEach((obj, index) => {
      if (index < 1 ) return;
      const comma = index < result.length - 1 ? ',' : '';
      //const risk_factor_e = Object.keys(obj.risk_factor).map(key => { return "\n    "+`"${key}"`+`: "${obj.risk_factor[key]}"`});
      
      
      const start = `{\n  "asset_name": "${obj.asset_name}",\n  "lat": ${obj.lat},\n  "long": ${obj.long},\n  "business_category": "${obj.business_category}",\n  "risk_rate": ${obj.risk_rate},\n  "risk_factor": ${obj.risk_factor},\n   "year": ${obj.year}\n}${comma}\n`;
      //console.log(risk_factor_e);
      writeStream.write(start);
    });
    writeStream.write('];\n');
    writeStream.end();
  });









