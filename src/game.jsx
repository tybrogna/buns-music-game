import { render } from 'preact'
import * as Settings from './settings.js'
// import './landing.css'

export default function() {
    let teams = localStorage.getItem('teams')
    let players = localStorage.getItem('players')

    console.log(teams)
    console.log(players)

    return (
        <div>game screen</div>
    )
}