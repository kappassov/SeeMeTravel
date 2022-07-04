import "./App.css";

import { CountrySelector } from "./components/controls";
import World from "./components/world";
import { useState, createContext, useContext } from "react";
import { CountryContext } from "./context";

function App() {
  const [country, setCountry] = useState();

  const handleChangeCountry = ({ value }) => {
    console.log("Appjs", value);

    setCountry(value);
  };

  console.log("APPJS", country);
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
    <CountryContext.Provider value={{ handleChangeCountry, country }}>
      <World />
      <CountrySelector />
    </CountryContext.Provider>
  );
}

export default App;
