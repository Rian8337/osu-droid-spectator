import { BlobReader, BlobWriter, TextWriter, ZipReader } from "./zip-js/index";
import { ChimuAPIResponse } from "./ChimuAPIResponse";
import { Preview } from "./Preview";
import { SpectatorDataProcessor } from "./spectator/SpectatorDataProcessor";
import { FayeClientManager } from "./spectator/FayeClientManager";
import { Anchor, BeatmapDecoder } from "./osu-base";

const container = $("#container")[0];
// TODO: this is test data, will be removed soon after proper room ID subscription is ready
const playerInfo1 = {
    uid: 51076,
    username: "Rian8337",
    mods: "",
};
const playerInfo2 = {
    ...playerInfo1,
    uid: 51077,
    mods: "HD",
};
const playerInfo3 = {
    ...playerInfo1,
    uid: 51078,
    mods: "HR",
};
const playerInfo4 = {
    ...playerInfo1,
    uid: 51079,
    mods: "HDHR",
};
const playerInfos = [playerInfo1, playerInfo2, playerInfo3, playerInfo4];
const previews: Preview[] = [];
previews.push(new Preview(container, Anchor.topLeft));
previews.push(new Preview(container, Anchor.topCenter));
previews.push(new Preview(container, Anchor.centerLeft));
previews.push(new Preview(container, Anchor.center));

const audio = new Audio();
let specDataProcessor: SpectatorDataProcessor | undefined;
let clientManager: FayeClientManager | undefined;

const background = new Image();
background.setAttribute("crossOrigin", "anonymous");

background.addEventListener("load", () => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d")!;

    // background-size: cover height
    const sWidth = background.height * (window.innerWidth / window.innerHeight);
    ctx.drawImage(
        background,
        (background.width - sWidth) / 2,
        0,
        sWidth,
        background.height,
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    // background dim
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    container.style.backgroundImage = `url(${canvas.toDataURL()})`;
});

background.addEventListener("error", () => {
    container.style.backgroundImage = "none";
});

$(window)
    .on("hashchange", () => {
        $(audio).trigger("pause");
        $("#play").removeClass("e");

        // eslint-disable-next-line no-control-regex
        const fileNameCleanerRegex = /[^\x00-\x7F]/g;
        const beatmapId = parseInt(location.hash.split("#")[1]) || 75;
        let backgroundFilename = "";
        let backgroundBlob = "";
        let audioFilename = "";
        let audioBlob = "";
        let osuFile = "";

        (async function () {
            const apiResponse = await fetch(
                `https://api.chimu.moe/v1/map/${beatmapId}`
            );
            const data: ChimuAPIResponse = await apiResponse.json();

            const { OsuFile: osuFileName, DownloadPath } = data;

            const downloadResponse = await fetch(
                `https://chimu.moe/${DownloadPath}`
            );

            if (
                downloadResponse.status >= 400 &&
                downloadResponse.status < 200
            ) {
                $("#title a").text("Beatmap not found in mirror, sorry!");
                return;
            }

            const blob = await downloadResponse.blob();
            const reader = new ZipReader(new BlobReader(blob));

            const entries = await reader.getEntries();
            if (entries.length > 0) {
                // For performance sake, get background and audio here.
                let found = false;

                for (const entry of entries) {
                    if (entry.filename !== osuFileName) {
                        continue;
                    }

                    found = true;
                    osuFile = await entry.getData(new TextWriter());

                    const backgroundMatch = osuFile.match(/(?<=0,0,").+(?=")/);
                    if (backgroundMatch) {
                        backgroundFilename = backgroundMatch[0];
                    }

                    const audioMatch = osuFile.match(
                        /(?<=AudioFilename: ).+(?=)/
                    );
                    if (audioMatch) {
                        audioFilename = audioMatch[0];
                    }

                    break;
                }

                if (!found) {
                    // If not found, try cleaning the file name.
                    for (const entry of entries) {
                        const cleanedFilename1 = entry.filename.replace(
                            /[^a-zA-Z]/g,
                            ""
                        );
                        const cleanedFilename2 = osuFileName.replace(
                            /[^a-zA-Z]/g,
                            ""
                        );

                        if (cleanedFilename1 !== cleanedFilename2) {
                            continue;
                        }

                        osuFile = await entry.getData(new TextWriter());
                        const backgroundMatch =
                            osuFile.match(/(?<=0,0,").+(?=")/);
                        if (backgroundMatch) {
                            backgroundFilename = backgroundMatch[0];
                        }

                        const audioMatch = osuFile.match(
                            /(?<=AudioFilename: ).+(?=)/
                        );
                        if (audioMatch) {
                            audioFilename = audioMatch[0];
                        }

                        break;
                    }
                }

                // Make background blob.
                if (backgroundFilename) {
                    let found = false;

                    for (const entry of entries) {
                        if (entry.filename !== backgroundFilename) {
                            continue;
                        }

                        found = true;
                        const extension = backgroundFilename.split(".").pop()!;
                        backgroundBlob = URL.createObjectURL(
                            await entry.getData(
                                new BlobWriter(`image/${extension}`)
                            )
                        );

                        break;
                    }

                    if (!found) {
                        // If not found, try cleaning file name first.
                        for (const entry of entries) {
                            if (
                                entry.filename
                                    .replace(fileNameCleanerRegex, "")
                                    .toLowerCase() !==
                                backgroundFilename
                                    .replace(fileNameCleanerRegex, "")
                                    .toLowerCase()
                            ) {
                                continue;
                            }

                            const extension = backgroundFilename
                                .split(".")
                                .pop()!;
                            backgroundBlob = URL.createObjectURL(
                                await entry.getData(
                                    new BlobWriter(`image/${extension}`)
                                )
                            );

                            break;
                        }
                    }
                }

                // Make audio blob.
                if (audioFilename) {
                    let found = false;

                    for (const entry of entries) {
                        if (entry.filename !== audioFilename) {
                            continue;
                        }

                        found = true;
                        const extension = audioFilename.split(".").pop()!;
                        audioBlob = URL.createObjectURL(
                            await entry.getData(
                                new BlobWriter(`audio/${extension}`)
                            )
                        );

                        break;
                    }

                    if (!found) {
                        // If not found, try cleaning file name first.
                        for (const entry of entries) {
                            if (
                                entry.filename
                                    .replace(fileNameCleanerRegex, "")
                                    .toLowerCase() !==
                                audioFilename
                                    .replace(fileNameCleanerRegex, "")
                                    .toLowerCase()
                            ) {
                                continue;
                            }

                            const extension = audioFilename.split(".").pop()!;
                            audioFilename = URL.createObjectURL(
                                await entry.getData(
                                    new BlobWriter(`audio/${extension}`)
                                )
                            );

                            break;
                        }
                    }
                }
            }

            await reader.close();

            if (backgroundBlob && osuFile) {
                const beatmap = new BeatmapDecoder().decode(osuFile).result;

                specDataProcessor = new SpectatorDataProcessor(beatmap, [
                    playerInfo1,
                    playerInfo2,
                    playerInfo3,
                    playerInfo4,
                ]);

                let firstLoad = false;

                for (let i = 0; i < playerInfos.length; ++i) {
                    previews[i].load(
                        beatmap,
                        specDataProcessor.managers.get(playerInfos[i].uid)!,
                        () => {
                            if (firstLoad) {
                                return;
                            }

                            firstLoad = true;
                            background.src = backgroundBlob;
                            audio.src = audioBlob;

                            const { metadata } = beatmap;
                            $("#title a")
                                .prop("href", `//osu.ppy.sh/b/${beatmapId}`)
                                .text(
                                    `${metadata.artist} - ${metadata.title} (${metadata.creator}) [${metadata.version}]`
                                );
                            $("#play").addClass("e");
                        },
                        (_, e) => alert(e)
                    );
                }

                clientManager = new FayeClientManager(specDataProcessor!);
                await clientManager.beginSubscriptions();
            } else {
                $("#title a").text("An error has occurred, sorry!");
            }
        })();
    })
    .trigger("hashchange");

$(document.body).on("mousemove", function () {
    const self = $(this);
    clearTimeout(self.data("h"));
    self.addClass("h").data(
        "h",
        setTimeout(() => {
            self.removeClass("h");
        }, 3000)
    );
});

$(audio)
    .on("play", () => {
        $("#play").removeClass("e");
        for (const preview of previews) {
            preview.beatmap.refresh();
        }

        requestAnimationFrame(function foo() {
            const currentTime = audio.currentTime * 1000;
            if (specDataProcessor?.isAvailableAt(currentTime) && !audio.ended) {
                audio.play();
            } else if (!audio.ended) {
                audio.pause();
            }

            if (!audio.paused) {
                for (const preview of previews) {
                    preview.at(audio.currentTime * 1000);
                }
            }

            requestAnimationFrame(foo);
        });
    })
    .on("durationchange", function () {
        $("#progress").val(0).prop("max", this.duration);
        $("#volume").trigger("change");
        $("#speed .e").trigger("click");
    })
    .on("timeupdate", function () {
        $("#progress").val(this.currentTime);
    });

(<JQuery<HTMLInputElement>>$("#progress")).on("change", function () {
    const value = parseInt(this.value);

    if (specDataProcessor) {
        // Don't forward too far if spectator data is not available yet.
        // Cap at latest event time.
        const { latestEventTime } = specDataProcessor;

        if (latestEventTime !== null && value < latestEventTime) {
            this.value = (latestEventTime / 1000).toString();
            return;
        }
    }

    audio.currentTime = value;
    $(audio).trigger("play");
});

(<JQuery<HTMLInputElement>>$("#volume")).on("change", function () {
    audio.volume = parseInt(this.value) / 100;
});

(<JQuery<HTMLButtonElement>>$("#speed button")).on("click", function () {
    $("#speed .e").removeClass("e");
    $(this).addClass("e");
    audio.playbackRate = parseFloat(this.value);
});

$("#play").on("click", function (e) {
    e.preventDefault();

    if ($(this).hasClass("e")) {
        audio.play();
    } else {
        audio.pause();
    }
});

$("#fullscreen").on("click", (e) => {
    e.preventDefault();

    const { document } = window;
    const { documentElement } = document;

    if (!document.fullscreenElement) {
        documentElement.requestFullscreen.call(documentElement);
    } else {
        document.exitFullscreen.call(document);
    }
});
