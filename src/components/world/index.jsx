import { useState, useEffect, useContext, useRef, useMemo } from "react";
import Globe from "react-globe.gl";
//import { CountryContext } from "../../context";
import { markerSvg } from "../../assets/camera";
import { Lightbox } from "react-modal-image-responsive";

import { useNavigate } from "react-router-dom";
import Select from "react-select";
import countryList from "react-select-country-list";
import { CountryContext } from "../../context";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import { storage } from "../controls/firebase";
import { db } from "../controls/firebase";
import { v4 } from "uuid";
import random from "alphanumeric";
import fontawesome from "@fortawesome/fontawesome";
import brands from "@fortawesome/fontawesome-free-brands";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import "../controls/index.css";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

const coords = require("country-coords");
const World = () => {
  const [countriesJson, setCountriesJson] = useState({ features: [] });
  const { countries } = useContext(CountryContext);
  const [isOpen, setIsOpen] = useState(false);
  const selected = [];
  const byCountry = coords.byCountry();
  const globeEl = useRef();

  //////////////////////////////////////////////////////////////////////////////////////////////////
  const [value, setValue] = useState("");
  const options = useMemo(() => countryList().getData(), []);
  const { handleChangeCountry } = useContext(CountryContext);
  const { handleDeleteCountry } = useContext(CountryContext);
  const [countriesList, setCountriesList] = useState([]);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [userId, setUserId] = useState();
  const [isOpenSide, setIsopenSide] = useState(false);
  const [isUploading, setIsUploaded] = useState(false);
  const iso = require("iso-3166-1-alpha-2");
  const navigate = useNavigate();

  fontawesome.library.add(brands);
  fontawesome.library.add(faUpload);

  let uploadedImages = [];

  const submitUser = async () => {
    const newArr = countriesList.map((el) => el.value);
    console.log("newArray: ", newArr);
    try {
      await setDoc(doc(db, "users", userId), {
        id: userId,
        countries: newArr,
        photos: imageURLs,
        date: Timestamp.fromDate(new Date()),
      });
      await navigate(`/${userId}`);
      console.log("Created user instance successfully with ID ", userId);
    } catch (er) {
      console.log(er);
    }
  };

  const uploadImage = async (event, value, file) => {
    console.log(value);
    uploadedImages[value] = false;
    setIsUploaded(true);
    event.preventDefault();
    if (file == null) return;
    const imageRef = ref(storage, `/${value}#${v4()}`);

    console.log(imageRef);
    await uploadBytes(imageRef, file).then((image) => {
      getDownloadURL(image.ref).then((url) => {
        console.log("Uploaded successfully with url: ", url);

        const userObject = {
          country: value,
          url: url,
        };
        setImageURLs((prev) => [...prev, userObject]);
        console.log(imageURLs);
      });

      uploadedImages[value] = true;
      const isUp = check(uploadedImages);
      setIsUploaded(!isUp);
    });
  };

  const check = (uploadedImages) => {
    for (let i in uploadedImages) {
      if (!uploadedImages[i]) {
        return false;
      }
    }
    return true;
  };

  const changeHandler = (value) => {
    let flag = true;
    countriesList.map((country) => {
      if (country.value == value.value) flag = false;
    });
    if (flag) {
      setValue(value);
      handleChangeCountry(value);
      handleChangeCountryList(value);
    }

    //handleDuplicateCountry(value);
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

  const generateUserId = async () => {
    const id = random(5);
    const docSnap = await getDoc(doc(db, "users", id));
    while (docSnap.exists()) {
      id = random(5);
      docSnap = await getDoc(doc(db, "users", id));
    }
    setUserId(id);
  };

  const handleDuplicateCountry = (value) => {
    options.filter((country) => country !== value);
  };
  /////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    fetch("datasets/countries.geojson")
      .then((res) => res.json())
      .then(setCountriesJson);
    generateUserId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  selected.push(countries);

  const gData = [
    selected[0].map((country) => {
      return {
        lat: byCountry.get(country).latitude,
        lng: byCountry.get(country).longitude,
        size: 20,
        color: "red",
      };
    }),
  ];
  //////////////////////////////////////////////////////////////////

  const ToggleSidebar = () => {
    isOpenSide === true ? setIsopenSide(false) : setIsopenSide(true);
  };
  //////////////////////////////////////////////////////////////////
  return (
    <div className="globe">
      <Popup
        trigger={
          <button
            className="btn btn-primary"
            style={{
              position: "absolute",
              zIndex: "1",
              left: "calc(50% - 169.51px / 2 )",
              marginTop: "10px",
              color: "#e5e8ec",
              backgroundColor: "#292d3e",
              border: "none",
            }}
          >
            <b>how does it work ?</b>
          </button>
        }
        modal
        nested
      >
        {(close) => (
          <div className="modal1">
            <div className="header1">🌍 welcome, dear traveler </div>
            <div className="content1">
              🚀 <b>STEP 1 - </b> open side bar on your left and choose
              countries that <b>you've traveled</b> so far 📄
              <br />{" "}
              <i style={{ marginLeft: "80px" }}>
                you can pick'em <u>from the list</u> or by{" "}
                <u>clicking on the Earth</u> itself
              </i>
              <br />
              <br />
              🚀 <b>STEP 2 - </b> upload your <b>photos</b> from{" "}
              <b>these countries </b> by browsing them in your device 📱
              <br />
              <br />
              🚀 <b>STEP 3 - </b> click <i>'Create My Earth'</i> and{" "}
              <b>share URL</b> with your travel story to the Web 🕸️
              <br />
            </div>
            <div className="actions1">
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: "#e5e8ec", color: "#292d3e " }}
                onClick={() => close()}
              >
                <b>got it !</b>
              </button>
            </div>
          </div>
        )}
      </Popup>
      <button
        onClick={ToggleSidebar}
        className="btn btn-primary"
        style={{
          position: "absolute",
          zIndex: "1",
          top: "calc(50% - 46.4px / 2 )",
          minWidth: "70px",
          marginLeft: "10px",
          backgroundColor: "#292d3e",
          border: "none",
        }}
      >
        <i className="fa-solid fa-angles-right fa-2x"></i>
      </button>
      <Globe
        className="globeGL"
        rendererConfig={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        // lineHoverPrecision={0}
        polygonsData={countriesJson.features}
        polygonAltitude={(d) =>
          selected[0].includes(d.properties.ISO_A2) ? 0.12 : 0.01
        }
        polygonCapColor={(d) =>
          selected[0].includes(d.properties.ISO_A2) ? "green" : "gray"
        }
        onPolygonClick={(d) => {
          // if(countriesList){
          //   return;
          // }

          const toCountryList = {
            value: d.properties.ISO_A2,
            label: iso.getCountry(d.properties.ISO_A2),
          };
          //console.log(toCountryList);
          changeHandler(toCountryList);
        }}
        polygonSideColor={() => "rgba(0, 100, 0, 0.15)"}
        polygonStrokeColor={() => "#111"}
        polygonLabel={({ properties: d }) => `
          <b>${d.ADMIN} (${d.ISO_A2})</b>
        `}
        polygonsTransitionDuration={500}
        // htmlElementsData={gData[0]}
        // htmlAltitude={0.13}
        // htmlElement={(d) => {
        //   const el = document.createElement("div");
        //   el.innerHTML = markerSvg;
        //   el.style.color = d.color;
        //   el.style.width = `${d.size}px`;

        //   el.style["pointer-events"] = "auto";
        //   el.style.cursor = "pointer";
        //   el.onclick = () => {
        //     setIsOpen(true);
        //   };
        //   return el;
        // }}
        //ref={globeEl}
      />

      {/* {isOpen && (
        <Lightbox
          medium="https://placekitten.com/1500/3000"
          alt="There will be pic from this country"
          onClose={() => setIsOpen(false)}
        />
      )} */}

      <div className={`sidebar ${isOpenSide == true ? "active" : ""}`}>
        <div className="sd-header">
          <h4 className="mb-0">Earth Setup</h4>
          <div
            className="btn btn-primary"
            style={{
              backgroundColor: "#e5e8ec",
              border: "none",
              color: "#292d3e",
            }}
            onClick={ToggleSidebar}
          >
            <i className="fa-solid fa-angles-left"></i>
          </div>
        </div>

        <div className="sd-body">
          <div className="controls">
            <Select
              options={options}
              value={value}
              onChange={changeHandler}
              className="selectComponent"
            />
            <div className="centerElements">
              <ul>
                {countriesList.map((country) => (
                  <li key={country.label}>
                    <a className="sd-link">
                      <b> {country.label}</b>
                      <form
                        className="imgUploadForm"
                        onSubmit={(event) => uploadImage(event, country.value)}
                      >
                        <input
                          type="file"
                          style={{ width: "200px" }}
                          onChange={(event) => {
                            console.log(event.target.files);
                            uploadImage(
                              event,
                              country.value,
                              event.target.files[0]
                            );
                          }}
                        />
                        <button
                          type="submit"
                          className="btn btn-outline-danger btn-floating"
                          style={{
                            width: "80px",
                            marginTop: "5px",
                          }}
                          onClick={() => {
                            handleDeleteCountryList(country);
                          }}
                        >
                          <i className="fa-solid fa-trash-can fa-xs"></i>
                        </button>
                      </form>
                    </a>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => submitUser()}
                className="btn btn-success"
                style={{
                  width: "fit-content",
                  fontWeight: "bold",
                  color: "#e5e8ec",
                }}
                disabled={isUploading}
              >
                {isUploading ? (
                  <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                ) : (
                  "CREATE MY EARTH"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`sidebar-overlay ${isOpenSide == true ? "active" : ""}`}
        onClick={ToggleSidebar}
      ></div>
    </div>
  );
};
export default World;
