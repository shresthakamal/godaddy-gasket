/// <reference types="@gasket/plugin-metadata" />

import type { Gasket } from '@gasket/core';
import type { PluginData } from '@gasket/plugin-metadata';

/** @type {import('@gasket/core').HookHandler<'metadata'>} */
export default function metadata(gasket: Gasket, data: PluginData) {
  return {
    ...data,
    lifecycles: [
      {
        name: 'appEvaluationEvent',
        method: 'execWaterfall',
        description: 'Modify CDE parameters before making API call',
        link: 'README.md#appEvaluationEvent'
      }
    ],
    configurations: [
      {
        name: 'cde',
        link: 'README.md#configuration',
        description: 'Configure CDE integration',
        type: 'object',
        properties: {
          enable: {
            type: 'boolean',
            description: 'Enable or disable CDE integration',
            default: false
          },
          options: {
            type: 'object',
            description: 'Options passed to the CDE middleware',
            required: true,
            properties: {
              sidecarUrl: {
                type: 'string',
                description: 'Sidecar URL for event bus'
              },
              loggingEnabled: {
                type: 'boolean',
                description: 'Enable or disable logging',
                default: true
              },
              dxEnabled: {
                type: 'boolean',
                description: 'Use DX Eventbus URL',
                default: true
              },
              maxRetries: {
                type: 'number',
                description: 'Maximum number of retries',
                default: 3
              },
              retryDelayMs: {
                type: 'number',
                description: 'Delay between retries in milliseconds',
                default: 250
              },
              samplingMethod: {
                type: 'string',
                description: 'Sampling method for events',
                default: 'Simple',
                enum: ['None', 'Simple', 'HashBasedSticky']
              },
              samplingRate: {
                type: 'number',
                description: 'Sampling rate as a proportion (0-1)',
                default: 0.1
              },
              cdeAppId: {
                type: 'string',
                description: 'CDE App ID'
              },
              commitHash: {
                type: 'string',
                description: 'Commit hash'
              },
              cdeAppVersion: {
                type: 'string',
                description: 'CDE App Version'
              },
              katanaArtifactVersion: {
                type: 'string',
                description: 'Katana Artifact Version'
              },
              bucketingIdType: {
                type: 'string',
                description: 'Type of bucketing ID used for events',
                default: 'visitorId',
                enum: ['shopperId', 'visitorId', 'customerId', 'careConversationId', 'careUcidJomaxId']
              },
              additionalExcludedPaths: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of regex patterns for paths to exclude from sending CDE events'
              },
              includedPaths: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of regex patterns for paths to include for sending CDE events'
              }
            }
          }
        }
      }
    ]
  };
}
