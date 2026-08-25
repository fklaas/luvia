# Luvia Living Compass — Runtime Vector Set

Status: M16.5E Experience foundation candidate

This directory contains the repository-native vector subset of the official
`LUVIA Living Compass Asset Set v2.0` dated 2026-08-25.

## Canonical use

- `primary.svg` is the travel-neutral Corporate master from 96 px upward.
- `compact.svg` is the shadow-free master for sizes below 64 px.
- `layers/face.svg`, `layers/two-ended-needle.svg` and `layers/hub.svg` are the
  composable animation layers.
- Only `layers/two-ended-needle.svg` may rotate. Face, hub and the whole mark
  remain fixed.

The neutral brand ring runs clockwise North/Red -> East/Orange -> South/Blue
-> West/Green -> North/Red. In an active Trip, `experience.v1` may derive a
two-family gradient from an explicit Trip accent plus a contrast-controlled
complement. The geometry and four direction points remain stable.

This asset set is Experience-owned presentation. It reads no Trip state and
contains no Domain Truth. Product adapters must pass the current accent as an
explicit projection.

Minimum clear space is 12.5 percent of the mark height. Do not add outlines,
rotate the whole mark, apply blanket colour filters or add shadows outside the
Corporate system.
