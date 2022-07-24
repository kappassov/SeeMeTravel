import { useState, useEffect } from "react";
import Globe from "react-globe.gl";
import { markerSvg } from "../../assets/camera";
import { Lightbox } from "react-modal-image-responsive";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../controls/firebase";
const coords = require("country-coords");
const iso = require("iso-3166-1-alpha-2");
const UserWorld = () => {
  const [countriesJson, setCountriesJson] = useState({ features: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [openedCountry, setOpenedCountry] = useState("");
  const [mapImages, setMapImages] = useState();
  const { id } = useParams();
  const docRef = doc(db, "users", id);
  const urls = new Map();

  const getData = async () => {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setSelected(docSnap.data().countries);
      docSnap.data().photos.forEach((obj) => {
        urls.set(obj.country, obj.url);
      });
      setMapImages(urls);
    } else {
      console.log("No such document!");
    }
  };

  const fetchCountries = () => {
    fetch("datasets/countries.geojson")
      .then((res) => res.json())
      .then(setCountriesJson);
  };

  useEffect(() => {
    fetchCountries();
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byCountry = coords.byCountry();

  const gData = [
    selected.map((country) => {
      return {
        name: country,
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
        rendererConfig={{
          antialias: false,
          powerPreference: "high-performance",
        }}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}
        polygonsData={countriesJson.features}
        polygonAltitude={(d) =>
          selected.includes(d.properties.ISO_A2) ? 0.12 : 0.01
        }
        polygonCapColor={(d) =>
          selected.includes(d.properties.ISO_A2) ? "green" : "gray"
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
            setOpenedCountry(d.name); //
            //console.log(openedCountry);
          };
          return el;
        }}
      />
      {isOpen && (
        <Lightbox
          medium={`${mapImages.get(openedCountry)}`}
          alt={`Photo from ${iso.getCountry(openedCountry)}`}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
export default UserWorld;
