import { render } from 'preact'
import path from 'path'
import { useState, useEffect } from 'preact/hooks'
import { $, $$$, range, Song } from '../js/helpers.js'
import * as Settings from '../settings.js'
import '../css/dataViewer.css'

let defaultLocation = "./games/test-game"
let defaultJson = "./data/data.json"
let songsData = {}

function testWrite(event) {
    let data = {}
    data.songsLocation = "songs"
    data.albumArtsLocation = "album_art"
    data.backgroundsLocation = "backgrounds"
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
        "albumArtImg": "ct.jpg"
    })
    data.music.jrpg.push({
        "title": "A New Hope",
        "composer": "Masayoshi Soken",
        "game": "Final Fantasy XIV",
        "year": 2013,
        "soundFile": "uldah.mp3",
        "startTime": "0",
        "backgroundImg": "uldah.jpg",
        "albumArtImg": "xivarr.jpg"
    })
    data.music.rts.push({
        "title": "Terran One",
        "composer": "Glenn Stafford",
        "game": "Starcraft",
        "year": 1997,
        "soundFile": "terran.mp3",
        "startTime": "20",
        "backgroundImg": "starcraft.jpg",
        "albumArtImg": "starcraft.jpg"
    })
    data.music.rts.push({
        "title": "Hell March",
        "composer": "Frank Klepacki",
        "game": "Command & Conquer: Red Alert",
        "year": 1995,
        "soundFile": "hellmarch.mp3",
        "startTime": "19",
        "backgroundImg": "cncra.jpg",
        "albumArtImg": "cncra.jpg"
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

async function testBridge(event) {
    let result = await window.nodejs.call('test', null)
    console.log(result)
}

function DataTableRows(props) {
    let {soundLocation, albumArtLocation, bgLocation} = props.songsData

    let Objs = Object.entries(props.songsData.music).map(([key, value]) => {
        let [categoryName, setCategoryName] = useState(key)
        let [tileImg, setTileImg] = useState(value.tileImg)
        let [extraRows, setExtraRows] = useState(0)
        let rowNum = 0
        let rowId = categoryName + "-row"
        let compressed = false
        let addRows = 0
        let toggleDisplay = (e) => {
            $$$(`[id^=${rowId}]`).forEach(a => {
                if (compressed) {
                    a.style.display = ""
                } else {
                    a.style.display="none"
                }
            })
            compressed = !compressed
        }

        let removeCategory = (e) => {
            e.target.parentNode.parentNode.parentNode.classList.add("deleted")
        }

        let SongRows = value.songs.map(song => {
            return (
                <SongRow song={song} rowId={rowId} />
            )
        })

        let NewRows = range(extraRows).map(num => {
            return (
                <SongRow song={Song()} rowId={rowId} />
            )
        })

        return (
            <tbody>
                <tr id='category-header'>
                    <td> - </td>
                    <td> <input id="tr-category-name" defaultValue={categoryName} onInput={e => setCategoryName(e.currentTarget.value)} /> </td>
                    <td> <input id="tr-tile-img" defaultValue={tileImg} onInput={e => setTileImg(e.currentTarget.value)} /> </td>
                    <td> <input type='button' value='compress' onClick={toggleDisplay}/> </td>
                    <td> <input type='button' style="color: red;" value='DELETE CATEGORY' onClick={removeCategory}/> </td>
                </tr>
                {SongRows}
                {NewRows}
                <tr>
                    <td> - </td>
                    <td> <input type='button' style="color: green;" value='+' onClick={e => {setExtraRows(extraRows + 1)}} /></td>
                </tr>
            </tbody>
        )
    })

    return(
        <>
        {Objs}
        </>
    )
}

function SongRow(props) {
	const [title, setTitle] = useState(props.song.title)
	const [composer, setComposer] = useState(props.song.composer)
	const [game, setGame] = useState(props.song.game)
	const [year, setYear] = useState(props.song.year)
	const [soundFile, setSoundFile] = useState(props.song.soundFile)
	const [startTime, setStartTime] = useState(props.song.startTime)
	const [background, setBackground] = useState(props.song.backgroundImg)
	const [album, setAlbum] = useState(props.song.albumArtImg)

    let removeSong = (e) => {
        e.target.parentNode.parentNode.classList.add("deleted")
    }

    return (
        <tr id={props.rowId}>
            <td> <input type='button' style="color: red;" value='X' onClick={removeSong} /></td>
            <td> <input id='tr-title' type='text' defaultValue={title} onInput={e => setTitle(e.currentTarget.value)} /> </td>
            <td> <input id='tr-composer' type='text' defaultValue={composer} onInput={e => setComposer(e.currentTarget.value)} /> </td>
            <td> <input id='tr-game-name' type='text' defaultValue={game} onInput={e => setGame(e.currentTarget.value)} /> </td>
            <td> <input id='tr-year' type='text' defaultValue={year} onInput={e => setYear(e.currentTarget.value)} /> </td>
            <td> <input id='tr-sound-file' type='text' defaultValue={soundFile} onInput={e => setSoundFile(e.currentTarget.value)} /> </td>
            <td> <input id='tr-start-time' type='text' defaultValue={startTime} onInput={e => setStartTime(e.currentTarget.value)} /> </td>
            <td> <input id='tr-background' type='text' defaultValue={background} onInput={e => setBackground(e.currentTarget.value)} /> </td>
            <td> <input id='tr-album' type='text' defaultValue={album} onInput={e => setAlbum(e.currentTarget.value)} /> </td>
        </tr>
    )
}

function GameSelect(props) {
    let [ gamesFound, setGamesFound ] = useState([])

    let checkFolderForGames = async () => {
        let filesInFolder = await window.nodejs.call('filesInFolder', './games')
        setGamesFound(filesInFolder)
    }

    useEffect(async () => {
        await checkFolderForGames()
    }, [])

    return (
        <>
        <input type="button" value="check for new games" onClick={checkFolderForGames} />
        <select id='game-folder-select' onChange={props.loadGameJson}>
            <option value=''></option>
            {gamesFound.map((item) => {
                return (
                    <option value={item}>{item}</option>
                )
            })}
        </select>
        </>
    )
}

function DataViewer() {
    let [haveJson, setHaveJson] = useState(false)

    let testRead = async function(target) {
        if (haveJson) {
            songsData = null
            setHaveJson(false)
        }
        let selectedGame = $('#game-folder-select').value
        let filesInFolder = await window.nodejs.call('filesInFolder', `./games/${selectedGame}`)
        let jsonFile = filesInFolder.filter(item => item.endsWith('.json'))[0]  // first json file in folder
        let jsonData = await window.nodejs.call('readFile', defaultLocation + '/' + jsonFile)
        songsData = jsonData
        setHaveJson(true)
    }

    if (!haveJson) {
        return (
            <div>
                <GameSelect loadGameJson={testRead} />
                {/* <input id='data-location-box' type='text' value={defaultLocation} /> */}
                {/* <input type='button' value='console.log teams' onClick={e => console.log(localStorage.getItem('teams'))} /> */}
                {/* <input type='button' value='console.log players' onClick={e => console.log(localStorage.getItem('players'))} /> */}
                {/* <input type='button' value='check folder' onClick={e => testBridge()} /> */}
                {/* <input type='button' value='write test file' onClick={e => testWrite()} /> */}
                {/* <input type='button' value='scan default folder' onClick={e => testRead()} /> */}
            </div>
        )
    } else {
        return (
            <div>
                <GameSelect loadGameJson={testRead} />
                {/* <input type='button' value='--- REFRESH ---' onClick={e => window.location.reload()} /> */}
                <input type='button' value='write test file' onClick={e => testWrite()} />
                <input type='file' value='open data file' accept='application/json' onChange={e => testRead(e.target)} />
                <fieldset>
                    <legend>Game Rules</legend>
                    <div>
                        <label for='countdown'>Countdown between selecting a category and song starts playing:</label>
                        <input name='coundown' type='text' value={songsData.countdown} />
                    </div>
                    <div>
                        <input name='autoReveal' type='checkbox' checked={songsData.autoReveal} />
                        <label for='autoReveal'>Auto Reveal Song Info?</label>
                    </div>
                    <div>
                        <label for='gameType'>Metadata Labels</label>
                        <select>
                            <option>Use Game/Composer</option>
                            <option>Use Album/Band</option>
                        </select>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Categories and Songs</legend>
                    <table>
                        <thead>
                            <tr>
                                <th>delete</th>
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
                            <tr>
                                <td>SAVE</td>
                                <td>AFTER</td>
                                <td>EDITING</td>
                            </tr>
                        </tfoot>
                    </table>
                </fieldset>
            </div>
        )
    }
}

function saveData() {
    let saveObj = {}
    let rows = $$$('tr')

    rows.forEach(row => {
        if (row.classList.contains("deleted")) {
            console.log('deleted')
            return
        }

        if (row.id == "category-header") {
            let category = $(row, '#tr-category-name').value
            let tileImg = $(row, '#tr-tile-img').value
            if (saveObj[category] == null) {
                saveObj[category]['songs'] = []
                saveObj[category]['tileImg'] = tileImg
            }
            return
        }

        let song = Song()
        let category = row.id.substr(0, row.id.indexOf('-'))
        song.title = $(row, '#tr-title').value
        song.composer = $(row, '#tr-composer').value
        song.game = $(row, '#tr-game-name').value
        song.year = $(row, '#tr-year').value
        song.soundFile = $(row, '#tr-sound-file').value
        song.startTime = $(row, '#tr-start-time').value
        song.backgroundImg = $(row, '#tr-background').value
        song.albumArtImg = $(row, '#tr-album').value
        saveObj[category].songs.push(song)
    })
    console.log(saveObj)
    // TODO finish this shit
}

function keylogger(e) {
    if (e.ctrlKey && e.keyCode == 83) {  // ctrl + s
        saveData()
    }
}

export default function() {
    window.addEventListener('keydown', keylogger)
    render(DataViewer(), document.body)
}

//todo: new category button
//      update song data type in helpers.js
//      add duration
//      actually save file
//      game/music industry mode