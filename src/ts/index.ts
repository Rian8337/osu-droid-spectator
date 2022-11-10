import {
    BlobReader,
    BlobWriter,
    TextWriter,
    ZipReader,
} from "./zip-js/index.js";
import { ChimuAPIResponse } from "./ChimuAPIResponse";
import { Preview } from "./Preview";

const preview = new Preview($("#container")[0]);
const audio = new Audio();

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
                preview.load(
                    backgroundBlob,
                    osuFile,
                    (preview) => {
                        audio.src = audioBlob;
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
    .on("pause", () => {
        $(document.body).trigger("mousemove");
        $("#play").addClass("e");
    })
    .on("play", () => {
        $("#play").removeClass("e");
        preview.beatmap.refresh();
        requestAnimationFrame(function foo() {
            preview.at(audio.currentTime * 1000);
            if (!audio.paused) {
                requestAnimationFrame(foo);
            }
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
    audio.currentTime = parseInt(this.value);
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
