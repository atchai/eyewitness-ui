<!--
	Message
-->

<template>

	<div :data-item-id="itemId" :class="[`message`, direction]">
		<div class="bubble" :title="sentAt | formatDate('DD/MM/YYYY HH:mm')">

			<div v-if="data.text && !(data.attachments && data.attachments.length)" class="inner text">
				{{data.text}}
			</div>

			<div v-if="data.options && data.options.length" class="options">
				<a v-for="option in data.options" :key="option.label" :href="`JavaScript:alert('This button does not work outside of the bot.')`" target="_blank">
					{{ option.label }}
				</a>
			</div>

			<div v-if="data.carousel" class="inner carousel">
				<div class="inner">
					<div v-for="element in data.carousel.elements" :key="element.label" class="item">
						<div class="image" :style="`background-image: url('${element.imageUrl}')`"></div>
						<div class="info">
							<div class="label">{{ element.label }}</div>
							<div class="text">{{ element.text }}</div>
						</div>
						<div class="buttons">
							<a v-for="button in element.buttons" :key="button.label" :href="button.type === `url` ? `${button.payload}?notrack=1` : `JavaScript:alert('This button does not work outside of the bot.')`" target="_blank">
								{{ button.label }}
							</a>
						</div>
					</div>
				</div>
			</div>

			<div v-if="data.attachments && data.attachments[0]" class="inner attachments">
				<audio v-if="data.attachments[0].type === `audio`" controls class="media-attachment">
					<source :src="data.attachments[0].remoteUrl" />
				</audio>
				<img v-if="data.attachments[0].type === `image`" :src="data.attachments[0].remoteUrl" class="media-attachment" @click="openAttachmentUrl" />
				<video v-if="data.attachments[0].type === `video`" controls playsinline class="media-attachment">
					<source :src="data.attachments[0].remoteUrl" :type="data.attachments[0].mimeType" />
				</video>
				<div v-if="data.attachments[0].type === `location`" class="media-attachment location">
					<strong>📍&nbsp;&nbsp;User sent a location:</strong><br>
					<a :href="data.attachments[0].remoteUrl" target="_blank">{{ data.attachments[0].filename }}</a>
				</div>
				<div v-if="data.attachments[0].type === `file`" class="media-attachment file">
					<strong>📄&nbsp;&nbsp;User sent a file:</strong><br>
					<a :href="data.attachments[0].remoteUrl" target="_blank">{{ data.attachments[0].filename }}</a>
				</div>
				<div v-if="data.attachments[0].type === `link`" class="media-attachment link">
					<strong>🔗&nbsp;&nbsp;User sent a link:</strong><br>
					<a :href="data.attachments[0].remoteUrl" target="_blank">{{ data.attachments[0].filename }}</a>
				</div>
			</div>

		</div>
	</div>

</template>

<script>

	export default {
		props: [`itemId`, `direction`, `humanToHuman`, `sentAt`, `data`],
		methods: {

			openAttachmentUrl () {
				window.open(this.data.attachments[0].remoteUrl);
			},

		}
	};

</script>

<style lang="scss" scoped>

	.message {
		display: flex;
		justify-content: flex-start;
		margin: 0.25rem 0;
		font-size: 90%;

		>.bubble {
			display: inline-block;
			border-radius: 1.25rem;
			background: #EFEFEF;
			max-width: 85%;
			overflow: hidden;

			>.options {
				@include user-select-off();
				display: flex;
				background: white;
				border: 1px solid $panel-border-color;

				>a {
					flex: 1;
					border-right: 1px solid $panel-border-color;
					height: 2.50rem;
					line-height: 2.50rem;
					text-align: center;
					text-decoration: none;
					white-space: nowrap;
					color: $faded-color;
					padding-left: 0.50rem;
					padding-right: 0.50rem;
					cursor: not-allowed;

					&:last-child {
						border-right: 0;
					}

					&:hover {
						opacity: 1.00;
					}
				}
			}

			>.inner {
				display: flex;
				border-radius: inherit;
				width: 100%;

				>* {
					flex: 1;
					border-radius: inherit;
				}

				&.text {
					padding: 0.50rem 0.75rem;
					line-height: 1.25em;
				}

				&.carousel {
					border-radius: inherit;

					>.inner {
						display: inline-flex;
						flex-wrap: nowrap;
						align-items: stretch;
						border-radius: inherit;
						@include scroll-horizontal();

						>.item {
							display: flex;
							flex-direction: column;
							flex: 0 0 auto;
							width: 14.00rem;
							border: 1px solid $panel-border-color;
							border-right: 0;
							background: white;
							font-size: 0.80em;

							&:first-child {
								border-top-left-radius: inherit;
								border-bottom-left-radius: inherit;
							}

							&:last-child {
								border-top-right-radius: inherit;
								border-bottom-right-radius: inherit;
								border-right: 1px solid $panel-border-color;
							}

							>.image {
								height: 8.00rem;
								background-size: cover;
								background-position: center;
							}

							>.info {
								flex: 1;
								color: $font-color-dark;
								padding: 0.50rem;

								>.label {
									font-weight: bold;
								}

								>.text {
									font-size: 0.90em;
									color: #7D7D7D;
								}
							}

							>.buttons {
								@include user-select-off();

								>a {
									display: block;
									height: 2.50rem;
									line-height: 2.50rem;
									color: $blue-color !important;
									text-align: center;
									text-decoration: none;
									border-top: 1px solid $panel-border-color;
									white-space: nowrap;
									text-overflow: ellipsis;
									overflow: hidden;
								}
							}
						}
					}
				}

				&.attachments {
					border-radius: inherit;

					>.media-attachment {
						display: block;
					}

					>img.media-attachment,
					>video.media-attachment {
						height: 15.00rem;
					}

					img.media-attachment {
						cursor: pointer;
					}

					>.media-attachment.location,
					>.media-attachment.file,
					>.media-attachment.link {
						padding: 0.50rem 0.75rem;
					}
				}
			}
		}

		&.outgoing {
			justify-content: flex-end;

			>.bubble {
				background: $blue-color;
				color: $font-color-light;

				:not(.options) {
					a {
						color: white !important;
					}
				}
			}
		}
	}

</style>
