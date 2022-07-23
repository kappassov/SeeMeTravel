import { useState, useEffect, useContext } from "react";
import Globe from "react-globe.gl";
import { markerSvg } from "../../assets/camera";
import { Lightbox } from "react-modal-image-responsive";
import { useParams } from "react-router-dom";
const coords = require("country-coords");

const UserWorld = () => {
  const [countriesJson, setCountriesJson] = useState({ features: [] });

  const [isOpen, setIsOpen] = useState(false);

  //FUNCTION TO GET ALL CHOSEN COUNTRIES with PHOTOS by unique ID from Database
  const { id } = useParams();

  useEffect(() => {
    fetch("datasets/countries.geojson")
      .then((res) => res.json())
      .then(setCountriesJson);
  }, []);

  const selected = [["KZ", "GR", "CN", "FR"]];
  const byCountry = coords.byCountry();

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
          const el = document.createElement("div");
          el.innerHTML = markerSvg;
          el.style.color = d.color;
          el.style.width = `${d.size}px`;

          el.style["pointer-events"] = "auto";
          el.style.cursor = "pointer";
          el.onclick = () => {
            setIsOpen(true);
            //setCurrentCountry("RU"); //
          };
          return el;
        }}
      />
      {isOpen && (
        <Lightbox
          medium="https://placekitten.com/1500/3000" // mybackend.com/{currentCounryCode}-${id}
          alt="Pic from this country"
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
export default UserWorld;
