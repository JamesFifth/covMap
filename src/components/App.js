import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import LineGraph from "./LineGraph";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import numeral from "numeral";
import Map from "./Map";
import "leaflet/dist/leaflet.css";
// import image from './images/virus.png';

const App = () => {

  // hooks
  // countries
  const [countries, setCountries] = useState([]);
  // which country we select, initial value is worldwide
  const [country, setInputCountry] = useState("worldwide");
  // data of individual country
  const [countryInfo, setCountryInfo] = useState({});
  

  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(2);

  // useEffect is a very powerful hooks in React
  // usage : runs a piece of code based pn a given condition

  // when app.js load we run the code to fetch data of all contries
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  // when app.js load fetch data and set variables
  useEffect(() => {
    const getCountriesData = async () => {
      // async -> send a request, wait for it, do something 
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          // loop the data and get the countries data (objects)
          const countries = data.map((country) => ({
            name: country.country, // United States, United Kingdom
            value: country.countryInfo.iso2, // UK, USA, FR
          }));
          // sort data by their cases in these countries
          let sortedData = sortData(data); // sort data
          setCountries(countries); // countries
          setMapCountries(data); // mapcountries
          setTableData(sortedData); // tableData
        });
    };
    getCountriesData();
  }, []);

  console.log(casesType);

  // 
  const onCountryChange = async (e) => {
    // grap the country code
    const countryCode = e.target.value;
    // console.log(countryCode);
    // set query url according to the choose in the dropdown
    const url = countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    // fetch data from url
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setInputCountry(countryCode);
        // all of the data from the country response stored into countryInfo
        setCountryInfo(data); 
        if(countryCode === "worldwide"){
          setMapCenter([34.80746, -40.4796]);
          setMapZoom(2);
        } else {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
        }
        
        
      });
  };

  return (
    // Whole App
    <div className="app">
      {/* Left part of App */}
      <div className="app__left">
        {/* Header section */}
        <div className="app__header">
          {/* <h1>CovTracker</h1> */}
          <h1 className="app-logo">CovMap</h1>
          <FormControl className="app__dropdown">
            {/* when we seclect country, will call onCountryChange function */}
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              {/* countries dropdown */}
              {/* default value is worldwide */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {/* specific countries : loop through all countries to show countries*/}
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select> 
          </FormControl>
        </div>
        {/* InfoBoxes section */}
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Total Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Cured"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        {/* Map section */}
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      {/* Right part of App */}
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            {/* table */}
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            {/* figure */}
            <h3>Worldwide new {casesType}</h3>
            <LineGraph casesType={casesType} />
          </div>
        </CardContent> 
      </Card>
    </div>
  );
};

export default App;
