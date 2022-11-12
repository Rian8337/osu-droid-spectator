import { BlobReader, BlobWriter, TextWriter, ZipReader } from "./zip-js/index";
import { ChimuAPIResponse } from "./ChimuAPIResponse";
import { Preview } from "./Preview";
import { SpectatorDataProcessor } from "./spectator/SpectatorDataProcessor";
import { FayeClientManager } from "./spectator/FayeClientManager";
import { DrawableBeatmap } from "./drawables/DrawableBeatmap";
import { BeatmapDecoder } from "./osu-base";

const preview = new Preview($("#container")[0]);
const audio = new Audio();
let specDataProcessor: SpectatorDataProcessor | undefined;
let clientManager: FayeClientManager | undefined;

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
                const beatmap = new DrawableBeatmap(
                    new BeatmapDecoder().decode(osuFile).result
                );

                specDataProcessor = new SpectatorDataProcessor(
                    beatmap.beatmap,
                    [
                        {
                            uid: 51076,
                            username: "Rian8337",
                            mods: "",
                        },
                    ]
                );

                preview.load(
                    backgroundBlob,
                    beatmap,
                    specDataProcessor.managers.get(51076)!,
                    async (preview) => {
                        audio.src = audioBlob;
                        clientManager = new FayeClientManager(
                            specDataProcessor!
                        );
                        await clientManager.beginSubscriptions();

                        const { metadata } = preview.beatmap.beatmap;
                        $("#title a")
                            .prop("href", `//osu.ppy.sh/b/${beatmapId}`)
                            .text(
                                `${metadata.artist} - ${metadata.title} (${metadata.creator}) [${metadata.version}]`
                            );
                        $("#play").addClass("e");
                    },
                    (_, e) => alert(e)
                );
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
            if (!audio.paused) {
                self.removeClass("h");
            }
        }, 3000)
    );
});

$(audio)
    .on("play", () => {
        $("#play").removeClass("e");
        preview.beatmap.refresh();
        requestAnimationFrame(function foo() {
            if (specDataProcessor) {
                const lookupTime =
                    preview.loadedAt.getTime() + audio.currentTime * 1000;

                if (specDataProcessor.isAvailableAt(lookupTime)) {
                    if (!audio.ended) {
                        audio.play();
                    }
                } else {
                    audio.pause();
                }
            } else {
                audio.pause();
            }

            if (!audio.paused) {
                preview.at(audio.currentTime * 1000);
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
