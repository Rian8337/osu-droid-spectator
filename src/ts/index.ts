import {
    Mod,
    ModAuto,
    ModDeflate,
    ModGrow,
    ModPerfect,
    ModReplayV6,
    ModSmallCircle,
    ModSuddenDeath,
    ModUtil,
} from "@rian8337/osu-base";
import { askRoomID } from "./roomLoader";
import { openDatabase } from "./settings/DatabaseSettings";
import { modIcons } from "./settings/SpectatorSettings";

(async () => {
    // Load mod icons
    console.log("Loading mod icons...");

    const invalidModsForMultiplayer = new Set<string>(
        [
            new ModAuto(),
            new ModDeflate(),
            new ModGrow(),
            new ModReplayV6(),
            new ModSuddenDeath(),
            new ModPerfect(),
            new ModSmallCircle(),
        ].map((m) => m.acronym),
    );

    for (const modType of ModUtil.allMods.values()) {
        const mod = new (modType as new () => Mod)();

        if (
            !mod.isApplicableToDroid() ||
            invalidModsForMultiplayer.has(mod.acronym)
        ) {
            continue;
        }

        await new Promise<void>((resolve) => {
            const img = new Image();
            img.src = `./assets/icons/${mod.acronym}.png`;

            img.onload = () => {
                modIcons.set(mod.acronym, img);
                resolve();
            };

            img.onerror = () => {
                resolve();
            };
        });
    }

    // Load fonts
    console.log("Loading fonts...");

    const fonts = [
        ["Torus-Thin", 100],
        ["Torus-Light", 300],
        ["Torus-Regular", 400],
        ["Torus-SemiBold", 600],
        ["Torus-SemiBold", 700],
        ["Torus-Bold", 800],
        ["Torus-Heavy", 900],
    ] as const;

    for (const [fontFile, weight] of fonts) {
        try {
            const face = new FontFace(
                "Torus",
                `url(./assets/fonts/${fontFile}.otf)`,
                { weight: weight.toString() },
            );

            await face.load();

            document.fonts.add(face);
        } catch (e) {
            console.error(e);
        }
    }

    await openDatabase();

    const searchParams = new URLSearchParams(location.search);

    askRoomID(undefined, searchParams.get("id"));
})().catch(console.error);
