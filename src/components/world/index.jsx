import { useState, useEffect, useContext } from "react";
import Globe from "react-globe.gl";
import { CountryContext } from "../../context";
import { markerSvg } from "../../assets/camera";
import { Lightbox } from "react-modal-image-responsive";
//import coords from "country-coords";
//import "react-18-image-lightbox/style.css";
const coords = require("country-coords");
const World = () => {
  //byCountry();
  const [countriesJson, setCountriesJson] = useState({ features: [] });
  //const [hoverD, setHoverD] = useState();
  const { countries } = useContext(CountryContext);
  //const [selected, setSelected] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  //const [imgIndex, setImgIndex] = useState(0);

  // console.log("world", countries);
  useEffect(() => {
    // load data
    fetch("datasets/countries.geojson")
      .then((res) => res.json())
      .then(setCountriesJson);
    //console.log(countries);,
  }, []);

  const selected = [];
  selected.push(countries);

  const byCountry = coords.byCountry();
  //console.log(byCountry.get("RU"));
  // Gen lat lang for photos
  /*
      lat: 60,
      lng: 90,
      size: 30,
      color: "red",
  */
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
  //console.log(gData[0]);
  const images = [
    // {
    //   title: "Travel 1",
    //   caption: "Caption 1",
    //   url: "//placekitten.com/1500/500",
    // },
    "//placekitten.com/1500/500",
    // "//placekitten.com/4000/3000",
    // "//placekitten.com/800/1200",
    // "//placekitten.com/1500/1500",
  ];
  return (
    <>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}
        polygonsData={countriesJson.features}
        polygonAltitude={(d) =>
          selected[0].includes(d.properties.ISO_A2) ? 0.12 : 0.01
        }
        polygonCapColor={(d) =>
          selected[0].includes(d.properties.ISO_A2) ? "green" : "gray"
        }
        polygonSideColor={() => "rgba(0, 100, 0, 0.15)"}
        polygonStrokeColor={() => "#111"}
        polygonLabel={({ properties: d }) => `
          <b>${d.ADMIN} (${d.ISO_A2})</b>
        `}
        //onPolygonHover={setHoverD}
        polygonsTransitionDuration={300}
        htmlElementsData={gData[0]}
        htmlAltitude={0.13}
        htmlElement={(d) => {
          //console.log("htmlEl", d);
          const el = document.createElement("div");
          el.innerHTML = markerSvg;
          el.style.color = d.color;
          el.style.width = `${d.size}px`;

          el.style["pointer-events"] = "auto";
          el.style.cursor = "pointer";
          el.onclick = () => {
            setIsOpen(true);
            //console.log(isOpen);
          };
          return el;
        }}
      />
      {isOpen && (
        <Lightbox
          medium="https://placekitten.com/1500/3000"
          alt="Pic from this country"
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
export default World;
