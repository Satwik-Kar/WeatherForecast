import './App.css';
import {useState} from "react";
import {useSpring,animated} from "react-spring";


function App() {
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [result, setResult] = useState(null);
    const FAHRENHEIT = 'f'
    const CELSIUS = 'c'
    const [degree, setDegree] = useState('c');
    const mostlyCloudy = require('./assets/Cloudy.png');
    const partlyCloudy = require('./assets/Partly Cloudy.png');
    const thunderStorm = require('./assets/Thunderstorms.png');

    function fetchWeatherByLocation() {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;

            setLatitude(latitude);
            setLongitude(longitude);
            apiCallByLocation(longitude, latitude, degree);

        }, (err) => {


            console.log(err)

        })


    }

    async function apiCall() {
        const url = 'https://yahoo-weather5.p.rapidapi.com/weather?location=sunnyvale&format=json&u=f';
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '08e1ab19d9msh129ebbd19f50f6bp161607jsn55ae4071c03e',
                'x-rapidapi-host': 'yahoo-weather5.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            setResult(result)

        } catch (error) {
            console.error(error);
        }

    }

    function apiCallByLocation(longitude, latitude, degree) {
        const url = `https://yahoo-weather5.p.rapidapi.com/weather?lat=${latitude}&long=${longitude}&format=json&u=${degree}`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '08e1ab19d9msh129ebbd19f50f6bp161607jsn55ae4071c03e',
                'x-rapidapi-host': 'yahoo-weather5.p.rapidapi.com'
            }
        };


        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();

            }).then(data => {

            setResult(data)
            setDegree(degree)
        }).catch(err => {

            console.error('There was a problem with the fetch operation:', err);

        });


    }

    function parseDate(unix) {
        let milliseconds = unix * 1000;

        let date = new Date(milliseconds);

        let year = date.getFullYear();
        let month = ('0' + (date.getMonth() + 1)).slice(-2);
        let day = ('0' + date.getDate()).slice(-2);

        return `${day}-${month}-${year}`;
    }

    const options = [
        {value: CELSIUS, label: '°C'},
        {value: FAHRENHEIT, label: '°F'},

    ];

    const onChange = (selected) => {
        if (selected.target.value === CELSIUS) {

            apiCallByLocation(longitude, latitude, 'c');
        } else if (selected.target.value === FAHRENHEIT) {


            apiCallByLocation(longitude, latitude, 'f');

        }


    }
    const getImageSource = (text) => {
        if (text === 'mostly-clouds') {
            return mostlyCloudy;

        } else if (text === 'partly-clouds') {

            return partlyCloudy;

        } else if (text === 'thunderstorm') {
            return thunderStorm;
        }

    }
    function Number({n}) {
        const {number} = useSpring({

            from:{number:0},
            number: n,
            delay:200,
            config:{mass:1,tension:20,friction:10},

        });
        return <animated.div>{number.to((n)=>n.toFixed(0))}</animated.div>

    }

    return (
        <div className="App">
            <header className="App-header">
                <div className={'left-div'}>
                    <h3>Enter your city</h3>

                    <p className={'interactions'}>
                        <input id={'input-city'}/>
                        <text>or</text>
                        <button id="lo-btn" onClick={() => {
                            fetchWeatherByLocation()

                        }}>Get weather from current location
                        </button>
                        <select className={'select'} onChange={onChange}>
                            {options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </p>

                    {result && (<>
                            <h3>{result?.location.city}, {result?.location.country}</h3>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <h1 style={{display: 'flex'}}>
                                    <Number n = {result?.current_observation.condition.temperature}/> °{degree}
                                </h1>
                                <img style={{width: '100px', height: '100px'}}
                                     src={require(`../src/assets/${result?.current_observation.condition.text}.png`)}/>

                                <h6>{result?.current_observation.condition.text}</h6>
                            </div>


                        </>
                    )}
                </div>


                {result && (
                    <div className={'forecast-div'}>


                        <h1 style={{alignSelf:'center' }} id={'for'}>Forecasts</h1>

                        <ul style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            {result?.forecasts.map(item => (

                                <li key={item.date} className={'list-item'}>


                                    <div className="day">{item.day}</div>
                                    <div className="date">
                                        {
                                            parseDate(item.date)


                                        }
                                    </div>
                                    <div className="details list-item-row">
                                        <p style={{display:'flex',flex: 1}}><strong>High:</strong> <Number n={item.high}/>°{degree}</p>
                                        <p style={{display:'flex',flex: 1}}><strong>Low:</strong> <Number n={item.low}/>°{degree}</p>
                                        <p style={{flex: 1}}>{item.text}</p>
                                        <img style={{width: '100px', height: '100px', marginLeft: '10px'}}
                                             src={require(`../src/assets/${item.text}.png`)}/>
                                    </div>


                                </li>


                            ))}
                        </ul>


                    </div>)}


            </header>

        </div>
    );
}

export default App;
