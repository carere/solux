# Vendored skills

Copied from [carere/gurafu](https://github.com/carere/gurafu/tree/efc017386a1c19f9325f7e03058c891753568899/.agents/skills), using only committed files from `.agents/skills/`.

- Source commit: `efc017386a1c19f9325f7e03058c891753568899`.
- Source Git tree: `d5248520d591064adf0a964e20ddee69b31c9269` (`efc017386a1c19f9325f7e03058c891753568899:.agents/skills`).
- Destination: `.agents/skills/`, preserving relative paths, bytes, and executable modes.
- Inventory: 156 files, including 32 `SKILL.md` entry points. This README is Solux-owned and is excluded from the copied tree.
- Vendor files are unchanged; preserve this committed snapshot rather than replacing it with a fresh upstream download.

## Repository configuration

Read [AGENTS.md](../../AGENTS.md), [CODING_STANDARD.md](../../CODING_STANDARD.md), and [docs/agents](../../docs/agents/workspace.md). Tracker, triage vocabulary, domain scope, and workspace commands belong there rather than in vendor skills. Installation does not invoke any skill, run the setup questionnaire, provision labels, or authorize external writes.

Refresh from an explicitly selected Gurafu commit, copy the entire committed subtree, and update this provenance and inventory together. Verify every blob and mode against that commit, including resources, scripts, notices, and agent definitions.

## Audit of this snapshot

- No hardcoded Gurafu project names, `carere/gurafu` tracker links, Zaidan/Cloudflare/Lightweight Charts settings, or developer-specific `/Users/` paths were found in the copied files. The source link above is provenance only.
- `.agents/skills/impeccable/...` paths match this installation. `~/.impeccable`, `~/.btca/agent/sandbox`, localhost URLs/ports, and `example.com` links are tool defaults or examples, not Solux configuration. Browser tooling remains subject to the active environment's instructions.
- Impeccable's launcher can download a separate engine from `pbakaus/impeccable` releases. Its skill metadata is `4.3.1`; the committed engine `scripts/VERSION` is `0.1.5`. These distinct source values were retained; the engine was not downloaded or executed.
- Literal relative Markdown links resolve except for template/example placeholders: domain-modeling's `ordering.md`, `billing.md`, and `fulfillment.md`; Playwright's example `.playwright-cli/page-2026-02-14T19-22-42-679Z.yml`; the wayfinder spec's angle-bracket map URL; and wayfinder's placeholder `link` target. They are not missing installation resources. External URL availability was not checked.
- `logging-best-practices/README.md` lists `metadata.json`, which is absent from the committed source. Its `SKILL.md` embeds author `boristane`, version `1.0.0`, and `license: MIT`; no metadata file was invented.

## License and upstream provenance gaps

`MATT-POCOCK-LICENSE` (MIT, copyright 2026 Matt Pocock) and `pr/CREDITS.md` were copied unchanged. The latter attributes material to Dex Horthy / HumanLayer's `show-me` skill. Preserve both.

The source subtree contains no separate license/notice for `agent-browser`, `btca-local`, `impeccable` (including bundled `modern-screenshot.umd.js`), `logging-best-practices`, or the Playwright CLI skill, and no separate license for the credited HumanLayer material. The logging skill declares MIT but supplies no dedicated license text/copyright notice. The Matt Pocock notice alone does not establish licensing for these other sources. No replacement licenses or ownership claims were added.

The Gurafu commit/tree below pins all copied bytes; it does not identify each original upstream commit. Apart from embedded skill metadata, engine version, and credits, per-source revision/license provenance is not supplied. Obtain any missing upstream notices and revisions before claiming complete third-party provenance.

## Exact copied tree

Entries are Git mode, blob SHA-1, and path relative to `.agents/skills/`. Compare with `git ls-tree -r efc017386a1c19f9325f7e03058c891753568899 -- .agents/skills` in the source repository; hash destination files with `git hash-object --no-filters <path>` and check executable modes.

```text
100644 f1dd2c09108dde1a5f56097cee8461b3ea834499 MATT-POCOCK-LICENSE
100644 8485a1f4b6a616d4861fc357ceb7afc93fd5654d agent-browser/SKILL.md
100644 fb58ef9febcfd558cdb4517e370f19034869ba26 ask-matt/PHASE-BOUNDARIES.md
100644 217ef27f54a6092a1f0e1340ba6ae1ba1da10e2f ask-matt/SKILL.md
100644 5c60d51b5b1248d7210bff8c6b42a5a06524b8a4 ask-matt/agents/openai.yaml
100644 4fb82dcadf95faf578b130612d5b2b9aae03abb5 btca-local/SKILL.md
100644 5925792fefcc6b0c1a005757faaa768ffd078ef0 code-review/SKILL.md
100644 9076774ba327f49068db9273feceda03bfe940fa code-review/agents/openai.yaml
100644 cd94075cfd754d147555c5d747a16431ed4c7dd8 codebase-design/DEEPENING.md
100644 0f1befb8c452c1d736cf8f6feaab080fd144da21 codebase-design/DESIGN-IT-TWICE.md
100644 3f63c8146dd2604b419c929e9876b90c30d410e9 codebase-design/SKILL.md
100644 3180715edb37f6e96bec42f92f00169faa8886ef codebase-design/agents/openai.yaml
100644 628becc99897741a8e143525d0d05880f8fad4c7 diagnosing-bugs/SKILL.md
100644 a13a755a77634ce61a649a3a0d905a66d3865b35 diagnosing-bugs/agents/openai.yaml
100644 243198464a8401a7ba1d63b3708fa43c3d067665 diagnosing-bugs/scripts/hitl-loop.template.sh
100644 2ab03d80adfef8b947707988b6eeb280dd2b8a38 domain-modeling/ADR-FORMAT.md
100644 bbcde0e52e3cd5b8dc2024eeed0a8e57de5a87fd domain-modeling/CONTEXT-FORMAT.md
100644 e4a6e00182ac4fc24ca111a7d6d89dcd19228496 domain-modeling/SKILL.md
100644 7f1522d2f11506ee205275ab7c282aa52366ecf6 domain-modeling/agents/openai.yaml
100644 3947ff9c4ad980d14fc07fccbf659d47c114e81d grill-me/SKILL.md
100644 4d6fb0c746c5d21364dce5d0cf8c51eab9712e7b grill-me/agents/openai.yaml
100644 62b9efb6f991d1b229adee7506962f13ced0c499 grill-with-docs/SKILL.md
100644 5dbe2780a51be3e9b118bd7758a73e54a9384e11 grill-with-docs/agents/openai.yaml
100644 d2f09a18e6a6c65c55f1271ba08dfeaf06f0bed3 grilling/SKILL.md
100644 ddbdb96139c0c1dfe6bca698f39d0465674b8a39 grilling/agents/openai.yaml
100644 a224edc643a20ddb989f9bca1547440169159810 handoff/SKILL.md
100644 6e1d8da121beceddc2f9ec7fa8714c1d914dd11a handoff/agents/openai.yaml
100644 f000bc443eaaa933a0268c0206b48ffc25688d72 impeccable/SKILL.md
100644 30f49ab65fff68050f4a7ba6cc389bc8ae840636 impeccable/agents/impeccable_asset_producer.toml
100644 45203ec73dc5d2509d0bd4f13e0eccbe51b4366e impeccable/agents/impeccable_documenter.toml
100644 cdecfe4dc2bef1990ca255cdcd99c54ade23d2e9 impeccable/agents/impeccable_finish_reviewer.toml
100644 469dd2da6512966a110b94e20abd18283d3689e7 impeccable/agents/impeccable_manual_edit_applier.toml
100644 ee6cae7726ef85d3744c1b978608668a07aefeef impeccable/agents/openai.yaml
100644 85f7c022f5c65baebdd8df16b996898a4f520e3a impeccable/reference/adapt.md
100644 88975b36f38bc6b709eec052d398ce8996d55d19 impeccable/reference/adapt.native.md
100644 1f67a6bb574960cccb1692f460cc5432baebad65 impeccable/reference/android.md
100644 c8fb9e038bb74a125646b64c49bc39711f63e8f4 impeccable/reference/animate.md
100644 0af13e165f6768d7b20e1d03dbd64ce36a2704ab impeccable/reference/audit.md
100644 321847a79680fd61908fced1ddab0ac20581aeb7 impeccable/reference/audit.native.md
100644 0ea9bcc0eb5f94d06bb3c3b52c5079eb1d0ca22a impeccable/reference/bolder.md
100644 4506a31c95e02b2ad918367a0ef4461643d51532 impeccable/reference/clarify.md
100644 02fa661efac9229d6e869a20ef8ee928d4b986a0 impeccable/reference/colorize.md
100644 ae213ce801ebb2085033b309b4144e8d7e9996ba impeccable/reference/craft-floor.md
100644 dbbc9402c07cdab21f2b6eb69279b8435fecfd7f impeccable/reference/craft.md
100644 c1285ca137d9aa1280e538601a0e84140246fe56 impeccable/reference/critique.md
100644 903b977764fd1a6e864e0862a7d1d695a7c4a6e8 impeccable/reference/degraded/asset-producer.md
100644 e9dfb799bcece32233386bf9702bc3141d56d196 impeccable/reference/degraded/documenter.md
100644 b5a131005b3bb617dbdfec584ac79100e17af02f impeccable/reference/degraded/finish-reviewer.md
100644 ef5095b924623ce04e02188a6790ebd98a273bcd impeccable/reference/degraded/manual-edit-applier.md
100644 60a8e83ee48d50901acfa886d3ec4bc72b40ec6f impeccable/reference/delight.md
100644 13f6cd5840c2030406c8fa59b70cb5fa86c239ab impeccable/reference/distill.md
100644 2d41282821fab74e95165d0277d9d561e32311b9 impeccable/reference/doctor.md
100644 83abb54b8ea773577a464f08ab78beaa411f4c70 impeccable/reference/document.md
100644 7e98bd04605aaa8e6e7200deff5fe5cd5cc28841 impeccable/reference/extract.md
100644 124742e1cca3caff2c495009a8f408382e73e7d1 impeccable/reference/harden.md
100644 bf297ed66bc9242760177d7375e921d0302e267c impeccable/reference/hooks.md
100644 0612fdde8a82dfe585a0a84eaaee833a5f0b146a impeccable/reference/init.md
100644 c6244dfe32176e5718d86211b7d1eb5601eb0860 impeccable/reference/ios.md
100644 aa547c742fc373bc459bdbb7977683441aa48ec0 impeccable/reference/layout.md
100644 6e10f00f7f2a789da582f38cdaef89de39ead266 impeccable/reference/live-setup.md
100644 fb85b3fdd99f94c78752da4c4d2d2c06bdaa1439 impeccable/reference/live.md
100644 cd2a22b98eac53ddfe5c2d61b4a31be693e58fe4 impeccable/reference/new-work.md
100644 90e33916ef348f050681d400a67e5745bfdb6d41 impeccable/reference/onboard.md
100644 524f2c3ae9fa497284e9699f3ca5320cce5d05cf impeccable/reference/operate.md
100644 fc56c22376854d77e8099b925232bba25001e5e6 impeccable/reference/optimize.md
100644 34dface28cb99425f4153ee08447220ea1839b79 impeccable/reference/overdrive.md
100644 f93170f773cac058f51e289603aed7575d62a6a2 impeccable/reference/polish.md
100644 870ea86599bebf65509291df22533e4b5c3d4ceb impeccable/reference/quieter.md
100644 6d48b47a02dece1f9edf2f071dba9f674433c8ba impeccable/reference/routing.md
100644 90a74ae813331cbce8fff6beb498ced77970fadf impeccable/reference/shape.md
100644 6f117f429cdefe60c0a07cbd5f02f72a40eb8a7d impeccable/reference/typeset.md
100644 f4dc6613eff861e34aa9123392afc9e59b0ca3a2 impeccable/reference/visualize.md
100644 9faa1b7a7339db85692f91ad4b922554624a3ef7 impeccable/scripts/VERSION
100644 dad8ef2e0ca304f6a0fe48c0c6b90880df93e01b impeccable/scripts/command-metadata.json
100644 1aca67220413ef163570c75405b444d7a27a32be impeccable/scripts/data/font-index-failures.json
100644 9d2029971df232a72ff6584d264c104490521742 impeccable/scripts/data/font-index.json
100755 eb60f8667dd6924bc6271e9e1a0761ea5f945751 impeccable/scripts/impeccable
100644 7ebe419bfe5b58c6214e39e8ce566181c72781d2 impeccable/scripts/impeccable.cmd
100644 e85c95c43ead132f04fe61dc3d0bf90b04e22d37 impeccable/scripts/live-browser-dom.js
100644 1c8514c7bcd8b8d889a1763965326fb6adec24a1 impeccable/scripts/live-browser-ignores.js
100644 1514bf472a5bb6dffdec1c67176713e3fab47af6 impeccable/scripts/live-browser-session.js
100644 ac6f185861ed917d88f039a696b0602a1b7ad9f2 impeccable/scripts/live-browser.js
100644 a9c5208f6b141d3bafdb8eb843d6fcbdcf23e370 impeccable/scripts/modern-screenshot.umd.js
100644 55ccfcdbe23fec31f9818ce355facd26f7f642a8 implement-spec/SKILL.md
100644 f5e91af21e38eb1a167ea5aa93dfc7da3c4637b4 implement-spec/agents/openai.yaml
100644 bd49e472984c7b99aac40286fdae749bb955a842 implement/SKILL.md
100644 f8794dc153b409052a9167baf10858cf01b36175 implement/agents/openai.yaml
100644 e39e8255b8797cf8257d014fb6658fb533f3a399 improve-codebase-architecture/HTML-REPORT.md
100644 d837ea9027b338c7b43ba61f69c234ce255587bc improve-codebase-architecture/SKILL.md
100644 706fdca096da5937fe57875a9154017d50668c42 improve-codebase-architecture/agents/openai.yaml
100644 580c80efd2f22a4cfe3d66f6bf7d59b6801668f7 logging-best-practices/README.md
100644 309f7e49f5292affba8c2f46e1c5b4c853ea3a26 logging-best-practices/SKILL.md
100644 baa6eec75273942d9849c63d132ad073a75053fa logging-best-practices/rules/context.md
100644 ec100d9b7a7d63907e2800e557788007542d3d0d logging-best-practices/rules/pitfalls.md
100644 05482095b2f5c4f37cf1bc1b7fd406711a585f59 logging-best-practices/rules/structure.md
100644 22b71cd949897b652439b60961344679d1f05a94 logging-best-practices/rules/wide-events.md
100644 6f34a187590d6fc045977f39776f1fda688dbacc playwright-cli/SKILL.md
100644 4e9fa6b99103bbe4e1262c37a9c4a664dfe1dbd5 playwright-cli/references/element-attributes.md
100644 bec2ec90e4adbc6ed56f06ab19c34916ce7f736b playwright-cli/references/playwright-tests.md
100644 9005fda67dfc4af13848fd9ebedee08420aeec97 playwright-cli/references/request-mocking.md
100644 98b541fb54cd68942795bc81519684eb2f58ecc9 playwright-cli/references/running-code.md
100644 bf39acd5f4e3863d1dc2891d50183c03a5293646 playwright-cli/references/session-management.md
100644 bb5021a09097127c051eaad83a262ff755e62971 playwright-cli/references/storage-state.md
100644 35a8d57d0433797c2cba6615f6e9dc1fc9b8f06a playwright-cli/references/test-generation.md
100644 7ce7babbdf17c685a65228d4328e56fbd42e10a2 playwright-cli/references/tracing.md
100644 5209d21ee09805485d1ce12e8bc70176f9b69e25 playwright-cli/references/video-recording.md
100644 5314bda2fa6005e264c9b5c1de7c425e719dc91f pr/CREDITS.md
100644 059fbeb6872a726032859f33e752c468920f986d pr/SKILL.md
100644 48286f48f53b937cc19c0e39899b5f956271a98d pr/agents/openai.yaml
100644 32be86a0a5d9928db84b3988e55f9debe476ab40 prototype/LOGIC.md
100644 a0044501fe0d385b4d8575b610188ede9b236ccf prototype/SKILL.md
100644 3977951663490882c2632b40695d9f59a2fe2408 prototype/UI.md
100644 1618b147965bc729b7bf3e8da5f130132067aadc prototype/agents/openai.yaml
100644 ffc9eb89849cc4cf74962ce93d786ffd17c6a5dc research/SKILL.md
100644 e18b96ca0ccc1003889d5d6991386207c2454bc2 research/agents/openai.yaml
100644 b6a4d60a081f5066d34a0b8697f37409c1d6cda4 retro/SKILL.md
100644 a2f0bac3f9cebf29beee2e79960cb876e0adc65d retro/agents/openai.yaml
100644 bdee405b48c01ff50db0e0a17fee48623540bf0e setup-matt-pocock-skills/SKILL.md
100644 65a0da8128c98051183235e490767a8065310868 setup-matt-pocock-skills/agents/openai.yaml
100644 1a4b7c9e294efb08b34295a67f611203c429358d setup-matt-pocock-skills/domain.md
100644 6a5a282ed02cf1c1a7d84028a7dc1fd4813529b0 setup-matt-pocock-skills/issue-tracker-github.md
100644 1aeb5d04fadd9b7240e3f70dff20a758a1c729ea setup-matt-pocock-skills/issue-tracker-gitlab.md
100644 0209a19af92c9c485cf3acc3d9e253171517ea17 setup-matt-pocock-skills/issue-tracker-local.md
100644 5276464244857a3cc29890ff4a978a197b21f3fc setup-matt-pocock-skills/triage-labels.md
100644 338824e7ed7dfc9011e2876b2b37af4cb317e9b6 tdd/SKILL.md
100644 651b838a7663e027b1b8884491e867f26bb9a021 tdd/agents/openai.yaml
100644 71cbfee674d93244ce81d1830b930ca9a69200bd tdd/mocking.md
100644 7ab86479f925a1f9e8ba680af33cb3b12e015381 tdd/tests.md
100644 fdd7e366ad9760588b28981e42b3d3b561e56aca teach/GLOSSARY-FORMAT.md
100644 953c61422776b47612c3c945920358ad7b5daee7 teach/LEARNING-RECORD-FORMAT.md
100644 45250bb1bad70988bf381625931df64645e10246 teach/MISSION-FORMAT.md
100644 18b588c8b6f96a50ae2352f264928c643d2782e4 teach/RESOURCES-FORMAT.md
100644 493fa3bae0dada971c4dfb965790e56920b1dced teach/SKILL.md
100644 3452a850e3b0c1f0a3d41b2bfd45164d2d38d7f6 teach/agents/openai.yaml
100644 dadd0c00d6a350acaa15bb9ca1b96b20ead684ca to-questionnaire/SKILL.md
100644 a58d14765beb4acb4c9708b516310558e1308a22 to-questionnaire/agents/openai.yaml
100644 b8ea7895b945b454ba9ff4c41e68d9b804261441 to-spec/SKILL.md
100644 549e6f76f020a1b9ba65f52ccda336566ee6222a to-spec/agents/openai.yaml
100644 a65e9449d665ca2420ad97051855672c692590d0 to-spec/regular-spec-template.md
100644 7806bfec0ced71a88f1504f2935b2604d9b83617 to-spec/wayfinder-spec-template.md
100644 153025812303cf0185fa79d1744ff19b86e8b5dd to-tickets/SKILL.md
100644 24605a5db64e4fc750b999aa94aea126bee814ee to-tickets/agents/openai.yaml
100644 1462fcd9e8cc21921158c296149dc05d9be39d20 triage/AGENT-BRIEF.md
100644 c9fba2f77ee0619975ec8488c0d4861a0c7e3151 triage/OUT-OF-SCOPE.md
100644 05f57a8d72cb9472d493c36399c2175f93e0b14b triage/SKILL.md
100644 acb366cf0f2527e8925ff1223b77610ac0b1be4c triage/agents/openai.yaml
100644 36d8ccd101bbe03f05411a9e9e527b019e580073 wait-what/SKILL.md
100644 6f7a9c33f99ec4ba70d986d6fc0de06c8b811bc3 wait-what/agents/openai.yaml
100644 975d6bf9c0a49d18a651f3335e0b4dcf8650fe31 wayfinder/SKILL.md
100644 b37544751e0570f9df8de6c02aef238de8c3e1e0 wayfinder/agents/openai.yaml
100644 c4294ad8298b9b95fc727496b1b802b1f7363fba wizard/SKILL.md
100644 b601bdf3a321e7d32d5714681540b811287d3988 wizard/agents/openai.yaml
100644 081ed3da860729c5e6fb1e7126c86b07b0ed56f0 wizard/template.sh
100644 9cdbdb22aadc438755392216e75ad9a14cc9832e writing-for-agents/SKILL-MECHANICS.md
100644 a37608daf6e835e767deecfb498facecaaba82ba writing-for-agents/SKILL.md
100644 079c933b75743dec18b5d0c01006def20b6aad26 writing-for-agents/agents/openai.yaml
```
