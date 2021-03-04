import { useEffect, useRef, useState } from "react";
import { FaSortAlphaDownAlt, FaSortAlphaDown } from "react-icons/fa";

function windowData(data, page = 1, per = 15) {
  return data.slice((page - 1) * per, page * per);
}

const debounce = (func, delay) => {
  let debounceTimer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
};

function App() {
  const windowRef = useRef();
  const [countries, setCountries] = useState([]);
  const [query, setQuery] = useState("");
  const [state, setState] = useState({
    countriesToShow: [],
    isLoading: false,
    page: 1,
    sort: { key: "name", direction: "ascending", isActive: true },
  });

  useEffect(() => {
    fetch("https://restcountries.eu/rest/v2/all")
      .then((res) => res.json())
      .then((res) => {
        setCountries(res);
        setState((prev) => ({ ...prev, countriesToShow: windowData(res) }));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    let currentWindowRef = windowRef.current;
    currentWindowRef.addEventListener("scroll", debounce(handleScroll, 1000));
    return () => {
      currentWindowRef.removeEventListener(
        "scroll",
        debounce(handleScroll, 1000)
      );
    };
  });

  useEffect(() => {
    const filteredCountries = countries.filter((country) => {
      return country.name.toLowerCase().includes(query.toLowerCase());
    });
    setState((prev) => ({
      ...prev,
      countriesToShow: windowData(filteredCountries),
    }));
  }, [query]);

  useEffect(() => {
    const sortedCountries = countries.slice().sort((c1, c2) => {
      if (state.sort.direction === "ascending") {
        return state.sort.key === "name"
          ? c1["name"].localeCompare(c2["name"])
          : c1[state.sort.key] - c2[state.sort.key];
      } else {
        return state.sort.key === "name"
          ? c2["name"].localeCompare(c1["name"])
          : c2[state.sort.key] - c1[state.sort.key];
      }
    });

    setState((prev) => ({
      ...prev,
      countriesToShow: windowData(sortedCountries),
    }));
    setCountries(sortedCountries);
  }, [state.sort.key, state.sort.direction]);

  function loadMore() {
    setState((prev) => {
      return {
        countriesToShow: [
          ...prev.countriesToShow,
          ...windowData(countries, prev.page + 1),
        ],
        loading: false,
        page: prev.page + 1,
        sort: prev.sort,
      };
    });
  }

  function handleScroll(e) {
    const currentWindowRef = windowRef.current;

    const currentScrollPos = currentWindowRef.scrollTop;
    const scrollHeight = currentWindowRef.scrollHeight;
    const threshold = currentWindowRef.offsetHeight;
    // threshold is basically window height
    // console.log(currentScrollPos, scrollHeight, threshold);
    // console.log(scrollHeight - currentScrollPos - threshold);

    if (scrollHeight - currentScrollPos - threshold <= 0) {
      loadMore();
    }
  }

  function handleChange(value) {
    setQuery(value);
  }

  function sortIcons(key) {
    return state.sort.key === key && state.sort.isActive ? (
      <FaSortAlphaDown
        onClick={() =>
          setState((prev) => ({
            ...prev,
            sort: { key: key, direction: "descending", isActive: false },
          }))
        }
        className={`text-white cursor-pointer ${
          state.sort.key === key && "text-green-500"
        }`}
      />
    ) : (
      <FaSortAlphaDownAlt
        onClick={() =>
          setState((prev) => ({
            ...prev,
            sort: { key: key, direction: "ascending", isActive: true },
          }))
        }
        className={`text-white cursor-pointer ${
          state.sort.key === key && "text-green-500"
        }`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-500 py-12 px-2 md:px-0 md:pt-24 text-xs sm:text-sm md:text-base">
      <h2 className="text-gray-200 text-2xl text-center font-bold">
        Sort/Search Countries
      </h2>
      <input
        className=" w-full block p-2 shadow-md rounded-t mx-auto container border border-gray-900"
        placeholder="Enter the text to search country name"
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
      />
      <section ref={windowRef} className="mx-auto window container">
        <div className="table w-full bg-blue-100 shadow-md">
          <table className="table-fixed w-full">
            <thead>
              <tr className="text-gray-100 bg-gray-600 ">
                <th className="w-1/4 py-1 border-r border-gray-100 ">
                  <div className="flex justify-center items-center">
                    <span className="mr-2">Name</span>
                    {sortIcons("name")}{" "}
                  </div>
                </th>
                <th className="w-1/4 py-1 border-r border-gray-100 ">
                  <div className="flex justify-center items-center">
                    <span className="mr-2">Population</span>
                    {sortIcons("population")}
                  </div>
                </th>
                <th className="w-1/4 py-1 border-r border-gray-100 ">
                  <div className="flex  justify-center items-center">
                    <span className="mr-2">Area</span>
                    {sortIcons("area")}{" "}
                  </div>
                </th>
                <th className="w-1/4 py-1 border-r border-gray-100">Gini</th>
              </tr>
            </thead>
            <tbody>
              {state.countriesToShow.map((country) => (
                <tr
                  key={country.name}
                  className="border-b-2 border-gray-300 cursor-pointer hover:shadow-md hover:bg-green-200"
                >
                  <td className="w-1/4 p-2 sm:px-5">{country.name}</td>
                  <td className="w-1/4 p-2 sm:px-10">{country.population}</td>
                  <td className="w-1/4 p-2 sm:px-10">{country.area}</td>
                  <td className="w-1/4 p-2 sm:px-10">{country.gini}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
