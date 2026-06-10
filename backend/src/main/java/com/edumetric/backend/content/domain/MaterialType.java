package com.edumetric.backend.content.domain;

/** The kind of learning material, which determines how it is rendered and stored. */
public enum MaterialType {
    /** Rich-text / markdown content page authored inline. */
    PAGE,
    /** An uploaded document hosted in object storage (PDF, slides, etc.). */
    FILE,
    /** An external hyperlink. */
    LINK,
    /** An embedded video (external URL, e.g. YouTube/Vimeo). */
    VIDEO
}
