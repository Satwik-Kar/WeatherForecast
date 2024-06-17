import './App.css';
import {useEffect, useState} from "react";
import {animated, useSpring} from "react-spring";


function App() {
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [result, setResult] = useState(null);
    const FAHRENHEIT = 'f'
    const CELSIUS = 'c'
    const [degree, setDegree] = useState('c');
    const propeller = require('./assets/propeller.png');
    const[speed,setSpeed] = useState(0);
    const[windDirection,setWindDirection] = useState('');


    const [colorString, setColorString] = useState('white');

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
            const number = Number(data?.current_observation.condition.temperature);
            if (number > 32 && number < 36) {

                setColorString('orange');
            } else if (number > 36) {
                setColorString('red');
            } else if (number < 32) {
                setColorString('white');

            }
            const speed = data?.current_observation.wind.speed;
            setSpeed(speed);
            const wD = data?.current_observation.wind.direction;
            setWindDirection(wD);
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
           to: { transform: `rotateZ(${rotation}deg)` },
            config: { duration: 1000 / speed },
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
                              ...propellerAnimation,transformOrigin: 'center center'
                          }}

            />
        );
    };


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
                            <div style={{display: 'flex', gap: '200px'}}>
                                <div style={{display: 'flex', flexDirection: 'row', gap: '30px'}}>
                                    <div className={'windmill-div'}>
                                        <Propeller speed={speed / 10}/>


                                        <div className={'windmill-pole'}>


                                        </div>
                                    </div>
                                    <div>
                                        <h3>Wind</h3>
                                        <h4>{(speed * 1.60934).toFixed(0)} km/h</h4>
                                        <h4>towards {windDirection}</h4>
                                    </div>


                                </div>

                                <div style={{display: 'flex'}}>
                                <h1 style={{display: 'flex', color: colorString}} id='temp'>
                                        <AnimatedNumber n={result?.current_observation.condition.temperature}
                                                        colorString={colorString}/> °{degree}
                                    </h1>
                                    <img style={{width: '100px', height: '100px'}}
                                         src={require(`../src/assets/${result?.current_observation.condition.text}.png`)}/>

                                    <h6>{result?.current_observation.condition.text}</h6>
                                </div>


                            </div>


                        </>
                    )}
                </div>


                {result && (
                    <div className={'forecast-div'}>


                        <h1 style={{alignSelf: 'center'}} id={'for'}>Forecasts</h1>

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
                                        <p style={{display: 'flex', flex: 1}}><strong>High:</strong> <AnimatedNumber
                                            n={item.high}/>°{degree}</p>
                                        <p style={{display: 'flex', flex: 1}}><strong>Low:</strong> <AnimatedNumber
                                            n={item.low}/>°{degree}</p>
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
