import React, { useState, useEffect, useRef } from 'react';
import {
  getLanguageSuggestions,
  normalizeLanguage
} from '../api';

const FeatureTogglePanel = ({
  features,
  onToggleFeature
}) => {
  const [languageInputs, setLanguageInputs] =
    useState({});

  const [editMode, setEditMode] =
    useState({});

  const [suggestions, setSuggestions] =
    useState({});

  const [loadingSuggestions, setLoadingSuggestions] =
    useState({});

  const debounceRefs = useRef({});

  const handleInputChange = async (
    featureId,
    value
  ) => {
    setLanguageInputs(prev => ({
      ...prev,
      [featureId]: value
    }));

    if (
      debounceRefs.current[featureId]
    ) {
      clearTimeout(
        debounceRefs.current[
          featureId
        ]
      );
    }

    if (!value.trim()) {
      setSuggestions(prev => ({
        ...prev,
        [featureId]: []
      }));
      return;
    }

    debounceRefs.current[
      featureId
    ] = setTimeout(async () => {
      try {
        setLoadingSuggestions(prev => ({
          ...prev,
          [featureId]: true
        }));

        const res =
          await getLanguageSuggestions(
            value
          );

        setSuggestions(prev => ({
          ...prev,
          [featureId]:
            res.suggestions || []
        }));

      } catch (err) {
        console.error(
          "Suggestion error:",
          err
        );

      } finally {
        setLoadingSuggestions(prev => ({
          ...prev,
          [featureId]: false
        }));
      }
    }, 350);
  };

  const handleSelectSuggestion = (
    featureId,
    language
  ) => {
    setLanguageInputs(prev => ({
      ...prev,
      [featureId]: language
    }));

    onToggleFeature(featureId, {
      language
    });

    setEditMode(prev => ({
      ...prev,
      [featureId]: false
    }));

    setSuggestions(prev => ({
      ...prev,
      [featureId]: []
    }));
  };

  const handleSave = async (
    featureId
  ) => {
    const value =
      languageInputs[featureId];

    if (!value?.trim()) {
      setEditMode(prev => ({
        ...prev,
        [featureId]: false
      }));
      return;
    }

    try {
      const res =
        await normalizeLanguage(
          value
        );

      const corrected =
        res.language || value;

      setLanguageInputs(prev => ({
        ...prev,
        [featureId]: corrected
      }));

      onToggleFeature(featureId, {
        language: corrected
      });

    } catch (err) {
      console.error(
        "Normalization error:",
        err
      );

      onToggleFeature(featureId, {
        language: value
      });
    }

    setEditMode(prev => ({
      ...prev,
      [featureId]: false
    }));

    setSuggestions(prev => ({
      ...prev,
      [featureId]: []
    }));
  };

  useEffect(() => {
    return () => {
      Object.values(
        debounceRefs.current
      ).forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className="panel feature-toggle-panel"
      style={{ flex: '0 0 23%' }}
    >
      <h3
        style={{
          marginBottom: '15px',
          color: '#212529'
        }}
      >
        Feature Toggles
      </h3>

      <div>
        {features.map(feature => {
          const isTranslation =
            feature.name ===
            "Translation";

          const isEditing =
            editMode[feature.id];

          const selectedLang =
            feature.config?.language;

          return (
            <div
              key={feature.id}
              className="feature-toggle-switch"
              style={{
                flexDirection:
                  'column',
                alignItems:
                  'stretch'
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center'
                }}
              >
                <div className="toggle-label">
                  <div className="toggle-name">
                    {feature.name}
                  </div>

                  <div className="toggle-description">
                    {
                      feature.description
                    }
                  </div>
                </div>

                <div
                  className={`toggle-switch ${
                    feature.enabled
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    onToggleFeature(
                      feature.id
                    )
                  }
                >
                  <div className="toggle-switch-knob"></div>
                </div>
              </div>

              {/* TRANSLATION */}
              {isTranslation &&
                feature.enabled && (
                  <div
                    style={{
                      marginTop:
                        "10px",
                      position:
                        "relative"
                    }}
                  >
                    {isEditing ||
                    !selectedLang ? (
                      <>
                        <input
                          type="text"
                          placeholder="Enter language..."
                          value={
                            languageInputs[
                              feature.id
                            ] ??
                            selectedLang ??
                            ""
                          }
                          onClick={(
                            e
                          ) =>
                            e.stopPropagation()
                          }
                          onChange={(
                            e
                          ) =>
                            handleInputChange(
                              feature.id,
                              e.target
                                .value
                            )
                          }
                          onKeyDown={(
                            e
                          ) => {
                            if (
                              e.key ===
                              "Enter"
                            ) {
                              e.preventDefault();

                              handleSave(
                                feature.id
                              );
                            }
                          }}
                          onBlur={() => {
                            setTimeout(
                              () => {
                                handleSave(
                                  feature.id
                                );
                              },
                              150
                            );
                          }}
                          className="language-input"
                        />

                        {loadingSuggestions[
                          feature.id
                        ] && (
                          <div className="language-suggestions">
                            <div className="language-suggestion-item disabled">
                              Loading...
                            </div>
                          </div>
                        )}

                        {!loadingSuggestions[
                          feature.id
                        ] &&
                          suggestions[
                            feature.id
                          ]?.length >
                            0 && (
                            <div className="language-suggestions">
                              {suggestions[
                                feature.id
                              ].map(
                                (
                                  lang,
                                  index
                                ) => (
                                  <div
                                    key={
                                      index
                                    }
                                    className="language-suggestion-item"
                                    onMouseDown={() =>
                                      handleSelectSuggestion(
                                        feature.id,
                                        lang
                                      )
                                    }
                                  >
                                    {
                                      lang
                                    }
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="selected-language-box">
                        <span>
                          🌐{" "}
                          {
                            selectedLang
                          }
                        </span>

                        <button
                          onClick={(
                            e
                          ) => {
                            e.stopPropagation();

                            setEditMode(
                              prev => ({
                                ...prev,
                                [feature.id]:
                                  true
                              })
                            );
                          }}
                          className="edit-language-btn"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureTogglePanel;