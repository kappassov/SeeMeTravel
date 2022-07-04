import { useState, useEffect, useContext } from "react";
import Globe from "react-globe.gl";
import { CountryContext } from "../../context";

const World = () => {
  const [countries, setCountries] = useState({ features: [] });
  const [hoverD, setHoverD] = useState();
  const { country } = useContext(CountryContext);
  const [selected, setSelected] = useState([]);

  console.log(country);
  useEffect(() => {
    // load data
    fetch("datasets/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then(setCountries);
    //console.log(countries);,
    setSelected((prevCountries) => [country, ...prevCountries]);
  }, []);

  /*
TODO:
    1) CONTROLS TAB: 
        add text field and list with countries to add to selectedCountries
    2) Configure scrolling on page, maybe resize the globe when scrolling down/up
    3) add pictures to each country selection    
*/

  return (
    <Globe
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      //   globeImageUrl="//../../assets/8k_earth_daymap.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      lineHoverPrecision={0}
      polygonsData={countries.features.filter(
        (d) => d.properties.ISO_A2 !== "AQ"
      )}
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
      onPolygonHover={setHoverD}
      polygonsTransitionDuration={300}
    />
  );
};
export default World;
