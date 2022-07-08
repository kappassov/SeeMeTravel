import React, { useState, useMemo, useContext } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { CountryContext } from "../../context";

export const CountrySelector = () => {
  const [value, setValue] = useState("");
  const options = useMemo(() => countryList().getData(), []);
  const { handleChangeCountry } = useContext(CountryContext);
  const [countriesList, setCountriesList] = useState([]);
  const changeHandler = (value) => {
    setValue(value);
    handleChangeCountry(value);
    //console.log(value);
    handleChangeCountryList(value);
    console.log("list: ", countriesList);
  };

  const handleChangeCountryList = ({ label }) => {
    setCountriesList((prevState) => [...prevState, label]);
  };

  const [picture, setPicture] = useState({});

  const uploadPicture = (e) => {
    console.log(e.target.files);
    setPicture({
      /* contains the preview, if you want to show the picture to the user
           you can access it with this.state.currentPicture
       */
      picturePreview: URL.createObjectURL(e.target.files[0]),
      /* this contains the file we want to send */
      pictureAsFile: e.target.files[0],
    });
    console.log("1", picture.picturePreview);
    console.log("2", picture.pictureAsFile);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const setImageAction = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", picture.pictureAsFile);

    const file64 = await toBase64(picture.pictureAsFile);
    //console.log(picture.pictureAsFile);
    const myKey = "6d207e02198a847aa98d0a2a901485a5";
    const data = await fetch(
      `https://freeimage.host/api/1/upload/?key=${myKey}&source=${picture.picturePreview}&format=json`,
      {
        method: "post",
        //headers: { "Content-Type": "multipart/form-data" },
        //body: formData,
      }
    );

    const uploadedImage = await data.json();
    if (uploadedImage) {
      console.log("Successfully uploaded image");
      console.log(uploadedImage);
    } else {
      console.log("Error Found");
    }
  };

  return (
    <>
      <Select options={options} value={value} onChange={changeHandler} />
      <ul>
        {countriesList.map((country) => (
          <li key={country}>
            <b> {country}</b>
            <form onSubmit={setImageAction}>
              <input type="file" onChange={uploadPicture} />
              <button type="submit"> Upload Photo</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
};
