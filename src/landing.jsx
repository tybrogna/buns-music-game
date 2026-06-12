import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { $, $$$, range } from './helpers.js'
import * as Settings from './settings.js'
import './landing.css'

function LogoBox(props) {
    return (
        <div id='logo-box'>
            <img class='logo' src='./src/assets/logo.webp' />
        </div>
    )
}

function TeamSetup(props) {
    let [teams, setTeams] = useState(0)

    useEffect(() => {
        let teamsAlreadySetUp = () => {
            let numberOfTeams = 0
            let storedTeams = localStorage.getItem('teams')
            let storedPlayers = localStorage.getItem('players')

            if (storedTeams != null) {
                let teams = storedTeams.split(',')
                numberOfTeams = Math.max(numberOfTeams, teams.length)

            }
            if (storedPlayers != null) {

            }
        }

        if (teams == 0) {
            teamsAlreadySetUp()
        }
    })

    console.log('i see ', teams, ' teams')

    let Teams = range(teams).map(item => {
        return (
            <>
            <input type='text' class='team-name-textbox' placeholder='Team Name...' />
            <textarea rows='6' class='players-textbox' cols='40' placeholder='Participants, one per line...' />
            </>
        )
    })

    return (
        <div id='team-setup-box'>
            <input type='button' value='Add Team' onclick={e => {setTeams(teams + 1)}} />
            <div>
                {Teams}
            </div>
        </div>
    )
}

function Landing() {
    return (
        <div id='shell'>
            <LogoBox />
            <TeamSetup />
            <input type='button' value='Start Game' onclick={e => startGame()}/>
        </div>
    )
}

function startGame(event) {
    let nodes = $$$('.team-name-textbox')
    let teams = Array.from(nodes).map(node => node.value)

    nodes = $$$('.players-textbox')
    let players = Array.from(nodes).map(node => node.value.split('\n'))

    if (teams.length != players.length) {
        console.log("a team is missing a name or players")
        return
    }

    localStorage.setItem('teams', teams)
    localStorage.setItem('players', players)
    window.open('/game', '_self')
}

export default function() {
    render(Landing(), document.body)
}