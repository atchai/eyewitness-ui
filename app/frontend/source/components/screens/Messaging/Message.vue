<!--
	Message
-->

<template>

	<div :class="[`message`, direction]">
		<div class="bubble">

			<div v-if="data.text" class="inner text">
				{{data.text}}
			</div>

			<div v-if="data.carousel" class="inner carousel">
				<div class="inner">
					<div
						v-for="element in data.carousel.elements"
						:key="element.label"
						class="item"
					>
						<div class="image" :style="`background-image: url('${element.imageUrl}')`"></div>
						<div class="info">
							<div class="label">{{ element.label }}</div>
							<div class="text">{{ element.text }}</div>
						</div>
						<div class="buttons">
							<a
								v-for="button in element.buttons"
								:key="button.label"
								:href="button.payload"
								target="_blank"
								>
									{{ button.label }}
								</a>
						</div>
					</div>
				</div>
			</div>

		</div>
	</div>

</template>

<script>

	export default {
		props: [`messageId`, `direction`, `humanToHuman`, `sentAt`, `data`],
	};

</script>

<style lang="scss" scoped>

	.message {
		display: flex;
		justify-content: flex-start;
		margin: 1.00rem 0;

		>.bubble {
			display: inline-block;
			border-radius: 1.00rem;
			background: #EFEFEF;
			max-width: 85%;
			overflow: hidden;

			>.inner {
				display: inline-flex;
				border-radius: inherit;
				width: 100%;

				>* {
					flex: 1;
					border-radius: inherit;
				}

				&.text {
					padding: 0.50rem 0.75rem;
				}

				&.carousel {
					overflow-x: auto;
					border-radius: inherit;

					>.inner {
						display: inline-flex;
						flex-wrap: nowrap;
						align-items: stretch;
						border-radius: inherit;
						overflow-x: auto;
						-webkit-overflow-scrolling: touch;

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
								>a {
									display: block;
									height: 2.50rem;
									line-height: 2.50rem;
									color: #2E8EFF;
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
			}
		}

		&.outgoing {
			justify-content: flex-end;

			>.bubble {
				background: #0683FF;
				color: $font-color-light;
			}
		}
	}

</style>
