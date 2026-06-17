import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { $, $$$, range } from './helpers.js'
import * as Settings from './settings.js'
// import './landing.css'

let songsData = {}

function testWrite(event) {
    let data = {}
    data.soundLocation = "sounds"
    data.bgLocation = "bgs"
    data.albumArtLocation = "albums"
    data.music = {
        "jrpg":[],
        "rts":[],
        "nintendo":[]
    }
    data.music.jrpg.push({
        "title": "Schala's Theme",
        "composer": "Yasunori Mitsuda",
        "game": "Chrono Trigger",
        "year": 1995,
        "soundFile": "schala.mp3",
        "startTime": "0",
        "backgroundImg": "ct.jpg",
        "albumImg": "ct.jpg"
    })
    data.music.jrpg.push({
        "title": "A New Hope",
        "composer": "Masayoshi Soken",
        "game": "Final Fantasy XIV",
        "year": 2013,
        "soundFile": "uldah.mp3",
        "startTime": "0",
        "backgroundImg": "uldah.jpg",
        "albumImg": "xivarr.jpg"
    })
    data.music.rts.push({
        "title": "Terran One",
        "composer": "Glenn Stafford",
        "game": "Starcraft",
        "year": 1997,
        "soundFile": "terran.mp3",
        "startTime": "20",
        "backgroundImg": "starcraft.jpg",
        "albumImg": "starcraft.jpg"
    })
    data.music.rts.push({
        "title": "Hell March",
        "composer": "Frank Klepacki",
        "game": "Command & Conquer: Red Alert",
        "year": 1995,
        "soundFile": "hellmarch.mp3",
        "startTime": "19",
        "backgroundImg": "cncra.jpg",
        "albumImg": "cncra.jpg"
    })
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    }); 
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function testFolder(event) {
    let result = await window.eapi.call('testhello', null)
    // let result = await eapi.call('testhello', `C:\\Users\\tybro\\Projects\\buns-music-game\\data\\albums`)
    console.log(result)
}

// async function testRead(target) {
//     console.log(target)
//     let fr = new FileReader()
//     fr.onload = (e) => {
//         console.log(JSON.parse(e.target.result))
//     }
//     fr.readAsText(target.files[0])
// }

function DataTableRows(props) {
    let {soundLocation, albumArtLocation, bgLocation} = props.songsData
    console.log(soundLocation)
    console.log(albumArtLocation)
    console.log(bgLocation)
    // try {
    //     let soundFiles = readdirSync(`./../data/${soundLocation}`)
    //     soundFiles.forEach(f => console.log(f))
    // } catch (err) { console.log(err) }

    let Objs = Object.entries(props.songsData.music).map(([key, value]) => {

        console.log(value)

        let SongRows = value.map(song => {
            return (
                <tr>
                    <td> <input value={song.title} /> </td>
                    <td> <input value={song.composer} /> </td>
                    <td> <input value={song.game} /> </td>
                    <td> <input value={song.year} /> </td>
                    <td> <input value={song.soundFile} /> </td>
                    <td> <input value={song.startTime} /> </td>
                    <td> <input value={song.backgroundImg} /> </td>
                    <td> <input value={song.albumImg} /> </td>
                </tr>
            )
        })

        return (
            <tbody>
                <tr>
                    <td> <input value={key} /> </td>
                </tr>
                {SongRows}
            </tbody>
        )
    })

    return(
        <>
        {Objs}
        </>
    )
}

function TestingBlock() {
    let [haveJson, setHaveJson] = useState(false)

    let testRead = async function(target) {
        console.log(target)
        let fr = new FileReader()
        fr.onload = (e) => {
            songsData = JSON.parse(e.target.result)
            setHaveJson(true)
            // console.log(JSON.parse(e.target.result))
        }
        fr.readAsText(target.files[0])
    }

    if (!haveJson) {
        return (
            <div>
                <input type='button' value='console.log teams' onClick={e => console.log(localStorage.getItem('teams'))} />
                <input type='button' value='console.log players' onClick={e => console.log(localStorage.getItem('players'))} />
                <input type='button' value='check folder' onClick={e => testFolder()} />
                <input type='button' value='write test file' onClick={e => testWrite()} />
                <input type='file' value='open data file' accept='application/json' onChange={e => testRead(e.target)} />
            </div>
        )
    } else {
        return (
            <div>
                <input type='button' value='write test file' onClick={e => testWrite()} />
                <input type='file' value='open data file' accept='application/json' onChange={e => testRead(e.target)} />
                <div>
                    <label>Sound folder: {songsData.soundLocation}</label>
                    <label>Album art folder: {songsData.albumArtLocation}</label>
                    <label>Background image folder: {songsData.bgLocation}</label>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>title</th>
                            <th>composer</th>
                            <th>game</th>
                            <th>year</th>
                            <th>sound file</th>
                            <th>start time</th>
                            <th>album image</th>
                            <th>background image</th>
                        </tr>
                    </thead>
                    <DataTableRows songsData={songsData} />
                    <tfoot>
                        <tr>SAVE AFTER EDITING</tr>
                    </tfoot>
                </table>
            </div>
        )
    }
}

export default function() {
    render(TestingBlock(), document.body)
}