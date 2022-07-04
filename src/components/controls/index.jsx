import React, { useState, useMemo, useContext } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { CountryContext } from "../../context";

export const CountrySelector = () => {
  const [value, setValue] = useState("");
  const options = useMemo(() => countryList().getData(), []);
  const { handleChangeCountry } = useContext(CountryContext);

  const changeHandler = (value) => {
    setValue(value);
    handleChangeCountry(value);
    console.log(value);
  };

  return <Select options={options} value={value} onChange={changeHandler} />;
};
