import { useState, useEffect, useContext } from "react";
import Globe from "react-globe.gl";
import { CountryContext } from "../../context";
import { markerSvg } from "../../assets/camera";
// import Lightbox from "react-18-image-lightbox";
// import "react-18-image-lightbox/style.css";
const World = () => {
  const [countriesJson, setCountriesJson] = useState({ features: [] });
  //const [hoverD, setHoverD] = useState();
  const { countries } = useContext(CountryContext);
  //const [selected, setSelected] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  // console.log("world", countries);
  useEffect(() => {
    // load data
    fetch("datasets/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then(setCountriesJson);
    //console.log(countries);,
  }, []);

  /*
TODO:
   
    2) Configure scrolling on page, maybe resize the globe when scrolling down/up
    3) add pictures to each country selection    
*/
  //setSelected((prevCountries) => [country, ...prevCountries]);
  const selected = [];
  selected.push(countries);

  // Gen random data
  const N = 30;
  // const gData = [...Array(N).keys()].map(() => ({
  //   lat: (Math.random() - 0.5) * 180,
  //   lng: (Math.random() - 0.5) * 360,
  //   size: 7 + Math.random() * 30,
  //   color: ["red", "white", "blue", "green"][Math.round(Math.random() * 3)],
  // }));

  const gData = [
    {
      lat: 60,
      lng: 90,
      size: 30,
      color: "red",
    },
  ];

  const images = [
    {
      title: "Travel 1",
      caption: "Caption 1",
      url: "//unsplash.com/photos/xr-y6Ruw7K8",
    },
  ];

  // {
  //   isOpen && (
  //     <Lightbox
  //       imageTitle={images[imgIndex].title}
  //       imageCaption={images[imgIndex].caption}
  //       mainSrc={images[imgIndex].url}
  //       nextSrc={images[(imgIndex + 1) % images.length].url}
  //       prevSrc={images[(imgIndex + images.length - 1) % images.length].url}
  //       onCloseRequest={() => setIsOpen(false)}
  //       onMovePrevRequest={() =>
  //         setImgIndex((imgIndex + images.length - 1) % images.length)
  //       }
  //       onMoveNextRequest={() => setImgIndex((imgIndex + 1) % images.length)}
  //     />
  //   );
  // }

  return (
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
      htmlElementsData={gData}
      htmlElement={(d) => {
        const el = document.createElement("div");
        el.innerHTML = markerSvg;
        el.style.color = d.color;
        el.style.width = `${d.size}px`;

        el.style["pointer-events"] = "auto";
        el.style.cursor = "pointer";
        el.onclick = () => {
          setIsOpen(true);
          console.log(isOpen);
        };
        return el;
      }}
    />
  );
};
export default World;
