import React, { useState, useMemo, useContext, useEffect } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { CountryContext } from "../../context";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  list,
  getMetadata,
} from "firebase/storage";
import { collection, getDocs, addDoc, doc } from "firebase/firestore";
import { storage, db } from "./firebase";
import { v4 } from "uuid";
import random from "alphanumeric";
import usedKeys from "../../keys.jsx";

export const CountrySelector = () => {
  const [value, setValue] = useState("");
  const options = useMemo(() => countryList().getData(), []);
  const { handleChangeCountry } = useContext(CountryContext);
  const { handleDeleteCountry } = useContext(CountryContext);
  const [countriesList, setCountriesList] = useState([]);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [userId, setUserId] = useState();
  const [visited, setVisited] = useState([]);

  const colRef = collection(db, "users");

  const submitUser = () => {
    const newArr = countriesList.map((el) => el.value);

    console.log(newArr);
    try {
      colRef.doc(userId).set({
        id: userId,
        countries: newArr,
        photos: imageURLs,
      });
    } catch (er) {
      console.log(er);
    }
  };

  const uploadImage = (event, value) => {
    event.preventDefault();
    if (imageUpload == null) return;
    const imageRef = ref(storage, `/${value}#${v4()}`);
    uploadBytes(imageRef, imageUpload).then((image) => {
      getDownloadURL(image.ref).then((url) => {
        console.log("Uploaded successfully with url: ", url);
        /*
        imageURLs:
                [
                  {
                    country: "KZ",
                    url: "https://shithosting.org/12312"
                  }
                ]
        */
        const userObject = {
          country: value,
          url: url,
        };
        setImageURLs((prev) => [...prev, userObject]);
      });
      // getMetadata(image.ref).then((metadata) => {
      //   console.log("metadata name: ", metadata.name);
      // });
    });
  };

  const changeHandler = (value) => {
    setValue(value);
    handleChangeCountry(value);
    handleChangeCountryList(value);
  };

  const handleDeleteCountryList = (country) => {
    const newCountries = countriesList.filter(
      (el) => el.label !== country.label
    );
    setCountriesList(newCountries);
    setValue("");
    handleDeleteCountry(country);
  };

  const handleChangeCountryList = (country) => {
    setCountriesList((prevState) => [...prevState, country]);
  };

  const generateUserId = () => {
    const id = random(5);
    setUserId(id);
  };

  useEffect(() => {
    generateUserId();
  }, []);

  return (
    <>
      <Select options={options} value={value} onChange={changeHandler} />
      <ul>
        {countriesList.map((country) => (
          <li key={country.label}>
            <b> {country.label}</b>
            <form onSubmit={(event) => uploadImage(event, country.value)}>
              <input
                type="file"
                onChange={(event) => {
                  setImageUpload(event.target.files[0]);
                }}
              />
              <button type="submit"> Upload Photo</button>
              <span
                style={{ marginLeft: "20px", color: "red" }}
                onClick={() => {
                  handleDeleteCountryList(country);
                }}
              >
                <b>X</b>
              </span>
            </form>
          </li>
        ))}
      </ul>
      <button onClick={() => submitUser}>CREATE MY EARTH</button>
    </>
  );
};
