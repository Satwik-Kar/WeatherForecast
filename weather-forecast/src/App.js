import './App.css';
import {useEffect, useState} from "react";
import {animated, useSpring} from "react-spring";


function App() {
    const [loading, setLoading] = useState(false);
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [resultWeather, setResultWeather] = useState(null);
    const [resultForecast, setResultForecast] = useState(null);
    const FAHRENHEIT = 'f'
    const CELSIUS = 'c'
    const [degree, setDegree] = useState(CELSIUS);
    const propeller = require('./assets/propeller.png');
    const [speed, setSpeed] = useState(0);
    const [windDirection, setWindDirection] = useState('');
    const [groupedArray, setGroupedArray] = useState(null);

    const [colorString, setColorString] = useState('white');
    const [bg, setBg] = useState('');
    function setStatusIdentifier(color) {
        const div = document.getElementById('status');
        if (color === 'green') {
            div.style.backgroundColor = '#6BEC66FF'
            div.style.border = '9px solid #214A20FF';

        } else if (color === 'red') {
            div.style.backgroundColor = '#EA6565FF'
            div.style.border = '9px solid #512222FF';
        }
    }

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


    function apiCallByLocation(longitude, latitude) {
        setLoading(true);
        const urlWeather = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=ac9c8b1df44a7385f94be73100a2b121`;
        const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=ac9c8b1df44a7385f94be73100a2b121`;

        const options = {
            method: 'GET',

        };


        fetch(urlForecast, options)
            .then(response => {
                if (!response.ok) {
                    console.error('Network response was not ok');
                    setLoading(false);
                }
                return response.json();

            }).then(data => {

            setResultForecast(data)
            const {list} = data;

            const groupedByDate = list.reduce((acc, item) => {
                const date = new Date(item.dt * 1000).toDateString();
                if (!acc[date]) {
                    acc[date] = {
                        date,
                        times: [],
                    };
                }
                acc[date].times.push({
                    time: new Date(item.dt * 1000).toLocaleTimeString(),
                    data: item,
                });
                return acc;
            }, {});

            const groupedArray = Object.values(groupedByDate);
            setGroupedArray(groupedArray);
            console.log(groupedArray);
            setLoading(false);

        }).catch(err => {

            console.error('There was a problem with the forecast fetch operation:', err);
            setLoading(false);

        });
        fetch(urlWeather, options)
            .then(response => {
                if (!response.ok) {
                    console.error('Network response was not ok');
                    setLoading(false);
                    setStatusIdentifier('red');

                }
                return response.json();

            }).then(data => {

            setResultWeather(data)
            setStatusIdentifier('green');
            setBg(require(`../src/assets/bg/${data.weather[0].main}.jpg`))
            setLoading(false);
            let celsius = Number(data?.main.temp) - 273.15;
            if (celsius > 32 && celsius < 36) {

                setColorString('orange');
            } else if (celsius > 36) {
                setColorString('red');
            } else if (celsius < 32 && celsius > 25) {
                setColorString('green');

            } else if (celsius < 25) {
                setColorString('blue');
            }
            const speed = data?.wind.speed;
            setSpeed(speed);
            const wD = getWindDirection(data?.wind.deg);
            setWindDirection(wD);

        }).catch(err => {

            console.error('There was a problem with the weather fetch operation:', err);
            setStatusIdentifier('red');

            setLoading(false);

        });


    }

    function parseDate(timestamp) {


        let date = new Date(timestamp);

        return date.toLocaleDateString('en-IN');
    }

    function parseTime(timestamp) {
        let date = new Date(timestamp);

        let hours = date.getHours();
        let minutes = date.getMinutes();


        let formattedHours = hours < 10 ? `0${hours}` : hours;
        let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;


        let period = hours >= 12 ? 'PM' : 'AM';


        if (hours > 12) {
            formattedHours -= 12;
        } else if (hours === 0) {
            formattedHours = 12;
        }

        return `${formattedHours}:${formattedMinutes} ${period}`;
    }

    function getDayFromDate(timestamp) {


        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let date = new Date(timestamp);
        return days[date.getDay()];


    }

    const options = [
        {value: CELSIUS, label: '°C'},
        {value: FAHRENHEIT, label: '°F'},

    ];

    const onChange = (selected) => {
        if (selected.target.value === CELSIUS) {

            setDegree(CELSIUS);

        } else if (selected.target.value === FAHRENHEIT) {


            setDegree(FAHRENHEIT);


        }


    }

    function AnimatedNumber({n, colorString}) {
        const {number} = useSpring({

            from: {number: 0},
            number: n,
            delay: 200,
            config: {mass: 1, tension: 20, friction: 10},

        });
        return <animated.div style={{color: colorString}}>{number.to((n) => n.toFixed(0))}</animated.div>

    }

    const Propeller = ({speed}) => {
        const [rotation, setRotation] = useState(0);

        const propellerAnimation = useSpring({
            to: {transform: `rotate(${rotation}deg)`},
            config: {duration: 1000 / speed},
        });

        useEffect(() => {
            const interval = setInterval(() => {
                setRotation(rot => rot + 360);
            }, 1000 / speed);

            return () => clearInterval(interval);
        }, [speed]);
        return (
            <animated.img src={propeller} className={'propeller'}
                          style={{
                              ...propellerAnimation
                          }}

            />
        );
    };

    function getChangedDegree(value) {
        let number = -1

        if (degree === CELSIUS) {

            number = Number(value) - 273.15;


        } else if (degree === FAHRENHEIT) {

            number = (Number(value) - 273.15) * (9 / 5) + 32;

        }
        return number;

    }

    function getWindDirection(degree) {

        degree = degree % 360;
        if (degree < 0) {
            degree += 360;
        }


        const directions = [
            {name: "North", min: 0, max: 11.25},
            {name: "North-Northeast", min: 11.25, max: 33.75},
            {name: "Northeast", min: 33.75, max: 56.25},
            {name: "East-Northeast", min: 56.25, max: 78.75},
            {name: "East", min: 78.75, max: 101.25},
            {name: "East-Southeast", min: 101.25, max: 123.75},
            {name: "Southeast", min: 123.75, max: 146.25},
            {name: "South-Southeast", min: 146.25, max: 168.75},
            {name: "South", min: 168.75, max: 191.25},
            {name: "South-Southwest", min: 191.25, max: 213.75},
            {name: "Southwest", min: 213.75, max: 236.25},
            {name: "West-Southwest", min: 236.25, max: 258.75},
            {name: "West", min: 258.75, max: 281.25},
            {name: "West-Northwest", min: 281.25, max: 303.75},
            {name: "Northwest", min: 303.75, max: 326.25},
            {name: "North-Northwest", min: 326.25, max: 348.75},
            {name: "North", min: 348.75, max: 360}
        ];


        for (let i = 0; i < directions.length; i++) {
            if (degree >= directions[i].min && degree < directions[i].max) {
                return directions[i].name;
            }
        }


        return "Unknown";
    }


    return (
        <div className="App">
            <img className={'bg-img'} src={bg}/>


            <div className={'left-weather-div'}>
                <div className={'status-container'}>
                    <div id={'status'}></div>
                </div>


                <p className={'interactions'}>

                    <button className="lo-btn" onClick={() => {
                        fetchWeatherByLocation();

                    }}>Fetch from current location
                    </button>
                    <select className={'select'} onChange={onChange}>
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </p>
                {
                    loading && (
                        <img style={{width: '100px', height: '100px'}} src={require('../src/assets/loading.gif')}
                             alt='loader'/>
                    )
                }

                {resultWeather && (<>
                        <h4 className={'city-name'}>{resultWeather?.name}, {resultWeather?.sys.country}</h4>
                        <div className={'info'}>
                            <div className={'wind-div'}>
                                <div className={'windmill-div'}>
                                    <Propeller speed={speed / 10}/>


                                    <div className={'windmill-pole'}>


                                    </div>
                                </div>
                                <div>
                                    <h3>Wind</h3>
                                    <h5>{(speed * 1.60934).toFixed(0)} km/h</h5>
                                    <h5>from {windDirection}</h5>
                                </div>


                            </div>

                            <div className={'temp-div'}>
                                <h1 style={{display: 'flex', color: colorString, margin: 30}} id='temp'>
                                    {degree === CELSIUS ? (
                                        <AnimatedNumber n={getChangedDegree(resultWeather?.main.temp)}
                                                        colorString={colorString}/>

                                    ) : (
                                        <AnimatedNumber n={getChangedDegree(resultWeather?.main.temp)}
                                                        colorString={colorString}/>

                                    )
                                    }

                                    °{degree}
                                </h1>
                                <img style={{width: '50px', height: '50px'}}
                                     src={require(`../src/assets/${resultWeather?.weather[0].main}.png`)}/>

                                <h6>{resultWeather?.weather[0].main}</h6>


                            </div>
                            <div className={'weather-variables'}>
                                <div className={'weather-variables-item'}>
                                    <img style={{width: '50px', height: '50px'}}
                                         src={require('../src/assets/atmospheric.png')}/>
                                    <h6>Pressure • {resultWeather?.main.pressure} hPa</h6>
                                </div>
                                <div className={'weather-variables-item'}>
                                    <img style={{width: '50px', height: '50px'}}
                                         src={require('../src/assets/humidity.png')}/>
                                    <h6>Humidity • {resultWeather?.main.humidity} %</h6>
                                </div>
                                <div className={'weather-variables-item'}>
                                    <img style={{width: '50px', height: '50px'}}
                                         src={require('../src/assets/temperature.png')}/>
                                    <h6>Feels Like
                                        • {getChangedDegree(resultWeather?.main.feels_like).toFixed(1)} °{degree}</h6>

                                </div>


                            </div>

                        </div>


                    </>
                )}
            </div>


            {resultForecast && (
                <div className={'forecast-div'}>


                    <h3 style={{alignSelf: 'center'}} id={'for'}>Forecasts</h3>

                    <ul className={'flexCol'}>
                        {groupedArray?.map(item => (

                            <li className={'list-item'}>
                                <div className={'list-item-date'}>
                                    <div className="day">{getDayFromDate(item.date)}</div>
                                    <div className="date">
                                        {
                                            parseDate(item.date)


                                        }
                                    </div>
                                </div>


                                {item.times.map(time => (
                                    <div className={'times'}>

                                        <div className="time">
                                            {
                                                time.time


                                            }
                                        </div>
                                        <div className="details list-item-row">
                                            <h5 style={{display: 'flex', flex: 1}}><strong>High:</strong>
                                                <AnimatedNumber
                                                    n={getChangedDegree(time.data.main.temp_max)}/>°{degree}</h5>
                                            <h5 style={{display: 'flex', flex: 1}}><strong>Low:</strong>
                                                <AnimatedNumber
                                                    n={getChangedDegree(time.data.main.temp_min)}/>°{degree}</h5>
                                            <h5 style={{flex: 1}}>{time.data.weather[0].main}</h5>
                                            <img style={{width: '50px', height: '50px', marginLeft: '10px'}}
                                                 src={require(`../src/assets/${time.data.weather[0].main}.png`)}
                                                 alt={'weather condition'}/>
                                        </div>
                                    </div>

                                ))}


                            </li>


                        ))}
                    </ul>


                </div>)}


        </div>
    )
        ;
}

export default App;
