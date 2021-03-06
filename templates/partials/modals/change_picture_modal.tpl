	<div id="change-picture-modal" class="modal" tabindex="-1" role="dialog" aria-labelledby="change-picture" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
					<h3 id="change-picture">[[user:change_picture]]</h3>
				</div>
				<div class="modal-body">
					<div id="default-box">
						<div class="user-icon user-profile-picture"></div>
						<span class="user-picture-label">[[user:default_picture]]</span>
						<i class='fa fa-check fa-2x'></i>
					</div>
					<br/>

					<!-- IF config.allowProfileImageUploads -->
					<div id="uploaded-box">
						<img id="user-uploaded-picture" src="" class="user-profile-picture">
						<span class="user-picture-label">[[user:uploaded_picture]]</span>
						<i class='fa fa-check fa-2x'></i>
					</div>

					<a id="uploadPictureBtn" href="#">[[user:upload_new_picture]]</a> <br/>
					<!-- IF config.hasImageUploadPlugin -->
					<a id="uploadFromUrlBtn" href="#">[[user:upload_new_picture_from_url]]</a> <br/>
					<!-- ENDIF config.hasImageUploadPlugin -->
					<a id="removeUploadedPictureBtn" href="#" class="<!-- IF !uploadedpicture -->hide<!-- ENDIF !uploadedpicture -->">[[user:remove_uploaded_picture]]</a>
					<!-- ENDIF config.allowProfileImageUploads -->
				</div>
				<div class="modal-footer">
					<button class="btn btn-default" data-dismiss="modal" aria-hidden="true">[[global:close]]</button>
					<button id="savePictureChangesBtn" class="btn btn-primary">[[global:save_changes]]</button>
				</div>
			</div>
		</div>
	</div>
