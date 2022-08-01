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
  const [isUploading, setIsUploaded] = useState(false);
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
      // getMetadata(image.ref).then((metadata) => {
      //   console.l

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
    // const m = uploadedImages.map((item) => {
    //   if (item.value == false) return false;
    //   return true;
    // });
    // //[true,true]
    // return m;
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
  const [isOpenSide, setIsopenSide] = useState(false);

  const ToggleSidebar = () => {
    isOpenSide === true ? setIsopenSide(false) : setIsopenSide(true);
  };
  //////////////////////////////////////////////////////////////////
  return (
    <div className="globe">
      <Popup
        trigger={
          <button
            className="button"
            style={{
              position: "absolute",
              zIndex: "1",
            }}
          >
            Instructions
          </button>
        }
        modal
        nested
      >
        {(close) => (
          <div className="modal1">
            <button className="close1" onClick={close}>
              &times;
            </button>
            <div className="header1"> Instructions: </div>
            <div className="content1">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, a
              nostrum. Dolorem, repellat quidem ut, minima sint vel eveniet
              quibusdam voluptates delectus doloremque, explicabo tempore dicta
              adipisci fugit amet dignissimos?
              <br />
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Consequatur sit commodi beatae optio voluptatum sed eius cumque,
              delectus saepe repudiandae explicabo nemo nam libero ad,
              doloribus, voluptas rem alias. Vitae?
            </div>
            <div className="actions1">
              <button
                className="button1"
                onClick={() => {
                  console.log("modal closed ");
                  close();
                }}
              >
                GOT IT
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
          top: "45%",
          minWidth: "70px",
          marginLeft: "10px",
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
            <i className="fa-solid fa-angles-left"></i>
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

                        {/* <button
                          type="submit"
                          className="btn btn-outline-primary btn-floating"
                          style={{ width: "200px" }}
                        >
                          <i className="fa-solid fa-cloud-arrow-up fa-sm"></i>
                        </button> */}
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
                }}
                disabled={isUploading}
              >
                {isUploading ? (
                  <i class="fa-solid fa-spinner fa-spin-pulse"></i>
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
