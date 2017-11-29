<!--
	CONVERSATION PANEL
-->

<template>

	<div class="panel">

		<div class="toolbar">
			<div class="image">
				<div class="image-circle"></div>
			</div>
			<div class="name">{{ userFullName }}</div>
			<div class="actions">
				<span class="label">Show Stories:</span>
				<div :class="{ tag: true, on: botEnabled }">
					<span v-if="botEnabled">Enabled</span>
					<span v-if="!botEnabled">Disabled</span>
				</div>
				<a href="JavaScript:void(0);" v-if="botEnabled" @click="setBotDisabled(threadId)"><span >disable</span></a>
				<a href="JavaScript:void(0);" v-if="!botEnabled" @click="setBotEnabled(threadId)"><span>enable</span></a>
			</div>
		</div>
		<div class="messages">



		</div>
		<div class="composer">
			<div class="image" @click="selectTextInput"><img src="providerImageUrl"></div>
			<div class="text-input"><textarea id="composer-text-input" placeholder="Write a reply..."></textarea></div>
			<div class="actions">
				<div class="icon">A</div>
				<div class="icon">B</div>
				<div class="icon">C</div>
				<div class="icon">D</div>
			</div>
		</div>

	</div>

</template>

<script>

	export default {
		computed: {

			threadId () { return this.$route.params.threadId; },

			userFullName () { return `Joe Bloggs`; },

			botEnabled () { return true; },

			providerImageUrl () { return ``; },

		},
		methods: {

			selectTextInput () {
				document.getElementById(`composer-text-input`).focus();
			},

		},
		data: function () {
			return {

			};
		},
	};

</script>

<style lang="scss" scoped>

	.panel {
		display: flex;
		flex-direction: column;
		flex: 1;

		>.toolbar {
			display: flex;
			height: 5.00rem;
			line-height: 5.00rem;
			border-bottom: 1px solid $panel-border-color;

			>.image {
				display: flex;
				flex-shrink: 0;
				width: 3.50rem;
				margin-left: 0.50rem;
				margin-right: 0.50rem;

				>.image-circle {
					display: block;
					margin: auto;
					width: 3.00rem;
					height: 3.00rem;
					border-radius: 50%;
					background-color: #9B9B9B;
					background-size: cover;
					overflow: hidden;
				}
			}

			>.name {
				flex: 1;
				font-size: 1.30rem;
				font-weight: bold;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			>.actions {
				max-width: 18.00rem;
				flex-shrink: 0;
				text-align: right;
				white-space: nowrap;
				margin-left: 0.50rem;
				margin-right: 0.50rem;
				@include user-select-off();

				.label {
					font-size: 1.30rem;
				}

				.tag {
					margin-left: 0.50rem;
				}

				a {
					margin-left: 0.50rem;
					color: $faded-color;
					text-decoration: none;
				}
			}
		}

		>.messages {
			flex: 1;
		}

		>.composer {
			display: flex;
			height: 8.00rem;
			padding: 1.00rem 0;
			border-top: 1px solid $panel-border-color;

			>.image {
				display: flex;
				flex-shrink: 0;
				width: 5.00rem;
				cursor: text;

				>img {
					width: 4.00rem;
					max-height: 4.00rem;
					margin: auto;
				}
			}

			>.text-input {
				flex: 1;
				height: 100%;

				>textarea {
					width: 100%;
					height: 100%;
					resize: none;
					border: 0;
					outline: 0;
				}
			}

			>.actions {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 10.00rem;
				height: 100%;
				flex-shrink: 0;

				>.icon {
					width: 2.00rem;
					text-align: center;
				}
			}
		}
	}

</style>
