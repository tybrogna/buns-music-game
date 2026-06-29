import { render } from 'preact'
import * as Settings from '../settings.js'
import { useState, useEffect } from 'preact/hooks'
import { signal } from 'preact/signal'
import { $, $$$, delay, range, Song, shuffle } from '../js/helpers.js'
import '../css/game.css'

let teams = {}
let game = {}

function GameScreen() {
    let [haveGame, setHaveGame] = useState(false)
    let [selectedSong, setSelectedSong] = useState('')

    useEffect(async () => {
        console.log('fetchin json data')
        let selectedGameFolder = localStorage.getItem('gameFolder')
        let filesInFolder = await window.nodejs.call('filesInFolder', `./games/${selectedGameFolder}`)
        let jsonFile = filesInFolder.filter(item => item.endsWith('.json'))[0]  // first json file in folder
        let jsonData = await window.nodejs.call('readFile', `./games/${selectedGameFolder}/${jsonFile}`)
        Object.entries(jsonData.music).forEach(([category, songs]) => {
            // console.log(category)
            songs.forEach(song => song.played = false)
        })
        game = jsonData
        console.log(game)
        setHaveGame(true)
    }, [])

    let openOverlay = (event) => {
        $('#player-overlay').style.display = 'block'
    }

    let closeOverlay = (event) => {
        console.log('closing overlay')
        $('#player-overlay').style.display = 'none'
        let lastSongPlayed = unplayedSongs(selectedSong).length == 0
        if (lastSongPlayed) {
            console.log(selectedSong)
            console.log($(`#${selectedSong}-tile`))
            $(`#${selectedSong}-tile`).style.background = 'grey'
        }
        setSelectedSong('')
    }

    if (!haveGame) {
        return (
            <div>loading...</div>
        )
    } else {

        let categories = Object.keys(game.music)
        return (
            <div className='shell'>
                <CategoryGrid categories={categories} selectFunc={setSelectedSong} />
                <input type='button' value='overlay' onClick={openOverlay} />
                <Teams />
                <div id='player-overlay' onClick={closeOverlay}>
                    <MusicPlayer category={selectedSong} />
                </div>
            </div>
        )
    }
}

function CategoryGrid(props) {
    let catNames = props.categories
    //give the categories random colors

    let CategoryTiles = catNames.map((catName) => { 
        return (
            <CategoryTile title={catName} selectFunc={props.selectFunc} />
        )
    })

    return (
        <>
        <div class='category-tiles-flexbox border-2'>
            {CategoryTiles}
        </div>
        </>
    )
}

// 

function CategoryTile(props) {
    let [remaining, setRemaining] = useState(unplayedSongs(props.title).length)
    let id = props.title + '-tile'
    let labelText = `${props.title} -- ${remaining}`

    let playSong = async (e) => {
        let categoryKey = e.target.id.substr(0, e.target.id.indexOf('-'))
        props.selectFunc(categoryKey)
        if (remaining > 0) {
            setRemaining(remaining - 1)
        }

        if (remaining == 0) {
            $(`#${categoryKey}-tile`).style.background = 'grey'
        }
    }

    return (
        <div id={id} class='category-tile-flex-item border-1' onClick={playSong}>
            {labelText}
        </div>
    )
}

function Teams() {
    let [score, setScore] = useState(0)
    let TeamColumns = Object.entries(teams).map(([name, players]) => {
        return (
            <div class='team-container'>
                <div class='team-info border-1'>
                    <div class='team-label'>{name}</div>
                    <PlayerList players={players} />
                </div>
                <div class='team-score border-2'>
                    <input type='button' class='plus-button' value='+' />
                    <div class='score-label'>{score}</div>
                    <input type='button' class='minus-button' value='-' />
                </div>
            </div>
        )
    })

    return (
        <div class='center-content'>
            <div class='teams-zone border-3'>
                {TeamColumns}
            </div>
        </div>
    )
}

function PlayerList(props) {
    let PlayerLabels = props.players.map((player) => {
        return (
            <div class='player-label'>
                {player}
            </div>
        )
    })

    return (
        <div class='team-player-names border-2'>
            {PlayerLabels}
        </div>
    )
}

let cd = signal(0)

function MusicPlayer(props) {
    let [countdown, setCountdown] = useState(0)
    let [isFinished, setIsFinished] = useState(false)

    useEffect(() => {
        const intervalId = setInterval(() => setCountdown(countdown - 1), 1000)
        return () => clearInterval(intervalId)
    })

    // useEffect(async () => {
    //     console.log('using effect')
    //     return
    //     while (!isFinished && countdown > 0) {
    //         await delay(1000)
    //         setCountdown(countdown - 1)
    //     }
    //     setIsFinished(true)
    // }, [countdown, isFinished])

    console.log(props.category)
    if (!(props.category in game.music)) {
        console.log('not a category')
        return
    }

    let songToPlay = shuffle(unplayedSongs(props.category))[0]
    if (songToPlay == undefined) {
        // $(`#${props.category}-tile`).style.background = 'grey'
        console.log("out of songs to play")
        return
    }

    setCountdown(10)

    songToPlay.played = true
    console.log(songToPlay)

    return (
        <div style="margin: 20%;">
            {songToPlay.title}, {countdown}
        </div>
    )
}

function unplayedSongs(category) {
    return game.music[category].filter(song => !song.played)
}

function defaultTeams() {
    let teams = "east side,west side"
    let players = 'east side|||notorious B.I.G.,east side|||puff daddy,west side|||2Pac,west side|||dr dre'
    return [teams,players]
}

export default function() {
    let incomingTeams = localStorage.getItem('teams')
    let incomingPlayers = localStorage.getItem('players')
    if (incomingTeams == '' || incomingPlayers == '') {
        [incomingTeams, incomingPlayers] = defaultTeams()
    }

    incomingTeams.split(',').forEach(t => teams[t] = [])
    incomingPlayers.split(',').forEach(player => {
        let [t, name] = player.split('|||')
        teams[t].push(name)
    })

    // console.log(teams)
    // console.log(players)
    // console.log(gameFolder)
    // let jsonData = getDataFile()
    // console.log('rendering page')
    render(GameScreen(), document.body)
}