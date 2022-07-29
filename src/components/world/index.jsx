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
  const [isUploaded, setIsUploaded] = useState(false);
  const navigate = useNavigate();

  fontawesome.library.add(brands);
  fontawesome.library.add(faUpload);
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

  const uploadImage = async (event, value) => {
    setIsUploaded(false);
    event.preventDefault();
    if (imageUpload == null) return;
    const imageRef = ref(storage, `/${value}#${v4()}`);
    await uploadBytes(imageRef, imageUpload).then((image) => {
      getDownloadURL(image.ref).then((url) => {
        console.log("Uploaded successfully with url: ", url);
        setIsUploaded(true);
        const userObject = {
          country: value,
          url: url,
        };
        setImageURLs((prev) => [...prev, userObject]);
        console.log(imageURLs);
      });
      // getMetadata(image.ref).then((metadata) => {
      //   console.log("metadata name: ", metadata.name);
      // });
    });
  };

  const changeHandler = (value) => {
    console.log(value);
    setValue(value);
    handleChangeCountry(value);
    handleChangeCountryList(value);
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
    // const docSnap = await getDoc(doc(db, "users", id));
    // if (docSnap.exists()) {
    //   generateUserId();
    // } else {
    //   setUserId(id);
    // }
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
  const [isOpenSide, setIsopenSide] = useState(false);

  const ToggleSidebar = () => {
    isOpenSide === true ? setIsopenSide(false) : setIsopenSide(true);
  };
  //////////////////////////////////////////////////////////////////
  return (
    <div className="globe">
      <button
        onClick={ToggleSidebar}
        className="btn btn-primary"
        style={{ position: "absolute", zIndex: "1" }}
      >
        <i className="fa-solid fa-angles-left"></i>
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
          selected.push(d.properties.ISO_A2);
          console.log(d.properties.ISO_A2);
        }}
        polygonSideColor={() => "rgba(0, 100, 0, 0.15)"}
        polygonStrokeColor={() => "#111"}
        polygonLabel={({ properties: d }) => `
          <b>${d.ADMIN} (${d.ISO_A2})</b>
        `}
        polygonsTransitionDuration={500}
        htmlElementsData={gData[0]}
        htmlAltitude={0.13}
        htmlElement={(d) => {
          const el = document.createElement("div");
          el.innerHTML = markerSvg;
          el.style.color = d.color;
          el.style.width = `${d.size}px`;

          el.style["pointer-events"] = "auto";
          el.style.cursor = "pointer";
          el.onclick = () => {
            setIsOpen(true);
          };
          return el;
        }}
        ref={globeEl}
      />

      {isOpen && (
        <Lightbox
          medium="https://placekitten.com/1500/3000"
          alt="There will be pic from this country"
          onClose={() => setIsOpen(false)}
        />
      )}

      <div className={`sidebar ${isOpenSide == true ? "active" : ""}`}>
        <div className="sd-header">
          <h4 className="mb-0">Earth Setup</h4>
          <div className="btn btn-primary" onClick={ToggleSidebar}>
            <i className="fa-solid fa-angles-right"></i>
          </div>
        </div>

        <div className="sd-body">
          {/* <ul>
            <li>
              <a className="sd-link">Menu Item 8</a>
            </li>
          </ul> */}
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
                        onSubmit={(event) => uploadImage(event, country.value)}
                      >
                        <input
                          type="file"
                          onChange={(event) => {
                            setImageUpload(event.target.files[0]);
                          }}
                        />

                        <button
                          type="submit"
                          className="btn btn-primary btn-floating"
                        >
                          <i className="fa-solid fa-cloud-arrow-up fa-sm"></i>
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-floating"
                          style={{ marginLeft: "20px", backgroundColor: "red" }}
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
                style={{ width: "fit-content", fontWeight: "bold" }}
              >
                CREATE MY EARTH
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
