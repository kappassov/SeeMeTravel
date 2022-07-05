import "./App.css";

import { CountrySelector } from "./components/controls";
import World from "./components/world";
import { useState, createContext, useContext } from "react";
import { CountryContext } from "./context";

function App() {
  const [countries, setCountries] = useState([]); // []

  const handleChangeCountry = ({ value }) => {
    console.log("Appjs", value);

    setCountries((prevState) => [...prevState, value]); // usa
  };

  console.log("APPJS", countries);
  return (
    /*
TODO:
    1) CONTROLS TAB: 
        add text field and list with countries to add to selectedCountries
    2) Configure scrolling on page, maybe resize the globe when scrolling down/up
    3) add pictures to each country selection    
*/

    // <>
    //
    <CountryContext.Provider value={{ handleChangeCountry, countries }}>
      <World />
      <CountrySelector />
    </CountryContext.Provider>
  );
}

export default App;
